---

description: "Task list for 001 Staff Records, Documents and Eligibility Gate"
---

# Tasks: Staff Records, Documents and Eligibility Gate

**Input**: Design documents from `/specs/001-staff-records-eligibility/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Included. Constitution Principle VI (Test-First, NON-NEGOTIABLE) requires rule tests
before or with implementation.

**Organization**: Grouped by user story (US1–US4 from spec.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1–US4)
- Base package `de.hsnv` (backend paths abbreviate `src/main/java/de/hsnv` as `…/hsnv`)

## Phase 1: Setup

- [X] T001 Create Maven parent `backend/pom.xml` (Java 21, modules `eligibility-engine` and `app`, Spring Boot 3.5.x BOM in `app` only)
- [X] T002 [P] Create `backend/eligibility-engine/pom.xml` with only JUnit 5 and AssertJ (test scope); no Spring, JPA or Timefold dependencies
- [X] T003 [P] Create `backend/app/pom.xml` with spring-boot-starter-web, data-jpa, security, validation, flyway-core, flyway-database-postgresql, postgresql, springdoc-openapi, testcontainers-postgresql, archunit-junit5, dependency on `eligibility-engine`
- [X] T004 [P] Create `frontend/` with Vite + React 18 + TypeScript, react-i18next, react-router, and Vitest in `frontend/package.json`
- [X] T005 [P] Add `docker-compose.yml` at repository root with `postgres:16` (db `hsnv`, password `dev`, port 5432)
- [X] T006 [P] Add CI workflow `.github/workflows/ci.yml` running `mvn -B verify` in `backend/` and `npm ci && npm test` in `frontend/`

## Phase 2: Foundational (blocks all user stories)

- [X] T007 Configure `backend/app/src/main/resources/application.yml` (datasource, `spring.jpa.hibernate.ddl-auto=validate`, `spring.jpa.properties.hibernate.jdbc.time_zone=UTC`, default locale `de`, profile `dev`)
- [ ] T008 Write Flyway `backend/app/src/main/resources/db/migration/V1__core.sql`: tables `branch` (bundesland "ISO code (e.g. `DE-BY`), required", zone_id default `Europe/Berlin`), `role` (code PK, food_contact boolean, name_key), `employee` (eu_status enum `EU_EEA`,`NON_EU`; contract_type enum `FULL_TIME`,`PART_TIME`,`MINIJOB`,`WERKSTUDENT`,`APPRENTICE`,`ON_CALL`; contracted_hours_per_week numeric(4,1) ≥ 0; first_food_work_date nullable; retention_until), `employee_branch`, `employee_role`, `user_account` (role enum `ADMIN`,`BRANCH_MANAGER`,`EMPLOYEE`; locale enum `de`,`en`,`vi`)
- [ ] T009 Write Flyway `backend/app/src/main/resources/db/migration/V2__audit.sql`: insert-only `audit_event` (action enum `CREATE`,`UPDATE`,`DELETE`,`VERIFY`,`DOWNLOAD_SCAN`; before/after jsonb) and revoke UPDATE/DELETE on it from the application role
- [ ] T010 [P] Create engine value types in `backend/eligibility-engine/src/main/java/de/hsnv/engine/model/` (`EmployeeSnapshot`, `ShiftRequest` with `Instant start/end` + `ZoneId`, `RequirementVersion`, `DocumentRecord`, `Absence`, `ProtectiveFlag`, `Severity`, `RuleType`)
- [ ] T011 [P] Create `Reason` and `EligibilityResult` (status `ELIGIBLE`|`ELIGIBLE_WITH_WARNINGS`|`NOT_ELIGIBLE`; reason fields `ruleCode`, `legalSource`, `severity`, `failingDate`, `measured`, `limit`, `messageKey`, `fixKey`, `args`) in `backend/eligibility-engine/src/main/java/de/hsnv/engine/model/`
- [ ] T012 [P] ArchUnit test `backend/app/src/test/java/de/hsnv/ArchitectureTest.java`: package `de.hsnv.engine..` must not depend on `org.springframework..`, `jakarta.persistence..`, `ai.timefold..`
- [ ] T013 Spring Security config `backend/app/src/main/java/de/hsnv/security/SecurityConfig.java` (session login, BCrypt) and `CurrentUser` helper exposing role, branchIds, employeeId
- [ ] T014 [P] `BranchScopeGuard` in `backend/app/src/main/java/de/hsnv/security/BranchScopeGuard.java` used by services to deny access outside caller's branches (HTTP 403)
- [ ] T015 [P] `AuditService` in `backend/app/src/main/java/de/hsnv/audit/AuditService.java` writing `audit_event` in the caller's transaction with JSON before/after
- [ ] T016 [P] i18n setup: `backend/app/src/main/resources/i18n/messages_de.properties`, `messages_en.properties`, `messages_vi.properties`, `LocaleResolver` from `Accept-Language`; `frontend/src/locales/{de,en,vi}.json` and `frontend/src/i18n.ts`
- [ ] T017 [P] Frontend shell: login page, layout, language switcher, API client generated from `specs/001-staff-records-eligibility/contracts/openapi.yaml` into `frontend/src/api/`
- [ ] T018 Dev seed `backend/app/src/main/resources/db/migration/dev/R__seed_dev.sql` (profile `dev` only): branches Bayern + Berlin, users `admin`, `manager.muenchen`, `emp.anna` (password `dev`), synthetic employees only

**Checkpoint**: app starts, login works, ArchUnit test green.

## Phase 3: User Story 1 – Employee records with documents (P1) 🎯 MVP

**Goal**: Admin/Branch Manager maintain employees, documents, absences and flags; employees view their own record.

**Independent Test**: Create an employee with roles and documents, reload, confirm data and scan visible only to authorised roles (quickstart scenario 9).

### Tests for US1

- [ ] T019 [P] [US1] Integration test `backend/app/src/test/java/de/hsnv/employee/EmployeeApiIT.java`: create/read/update/deactivate; manager of Bayern gets 403 on Berlin employee
- [ ] T020 [P] [US1] Integration test `backend/app/src/test/java/de/hsnv/document/DocumentApiIT.java`: add document, verify, scan upload rejected (409) when type not `copy_required`, scan > 10 MB rejected, download writes `DOWNLOAD_SCAN` audit event
- [ ] T021 [P] [US1] Integration test `backend/app/src/test/java/de/hsnv/me/MyRecordIT.java`: employee sees own record only and cannot change verification status

### Implementation for US1

- [ ] T022 [US1] Flyway `V3__documents.sql`: `requirement_type` (code PK, name_key, copy_required), `document_record` (status enum `UNVERIFIED`,`VERIFIED`,`REJECTED`; "only VERIFIED counts"; expiry_date "required for `FIXED_EXPIRY` types"; scan_ref "only if type.copy_required"; legacy_equivalent boolean), `protective_flag` (kind enum `MUSCHG`,`MUSCHG_NIGHT_22_APPROVED`,`SGBIX_207_EXEMPTION`; "no free text"), `absence` (kind enum `APPROVED_LEAVE`,`SICK_LEAVE`,`MUSCHG_PROTECTION_PERIOD`; "inclusive; end ≥ start" as CHECK)
- [ ] T023 [P] [US1] JPA entities + repositories in `…/hsnv/employee/` (`Branch`, `Role`, `Employee`) 
- [ ] T024 [P] [US1] JPA entities + repositories in `…/hsnv/document/` (`RequirementType`, `DocumentRecord`, `ProtectiveFlag`, `Absence`)
- [ ] T025 [US1] `EmployeeService` in `…/hsnv/employee/EmployeeService.java`: CRUD with `BranchScopeGuard`, deactivation sets `retention_until`, audit on every change
- [ ] T026 [US1] `DocumentService` in `…/hsnv/document/DocumentService.java`: add/edit (date edit resets status to `UNVERIFIED`), verify/reject, absences, flags, audit
- [ ] T027 [P] [US1] `ScanStorage` interface + `LocalDiskScanStorage` in `…/hsnv/document/scan/` (UUID file names outside web root, PDF/JPEG/PNG, ≤ 10 MB)
- [ ] T028 [US1] Controllers per contract in `…/hsnv/employee/EmployeeController.java`, `…/hsnv/document/DocumentController.java`, `…/hsnv/me/MeController.java` (`/employees`, `/employees/{id}/documents`, `/documents/{docId}/verify`, `/documents/{docId}/scan`, `/employees/{id}/absences`, `/employees/{id}/flags`, `/me/record`)
- [ ] T029 [P] [US1] Frontend pages `frontend/src/pages/EmployeeList.tsx`, `EmployeeDetail.tsx` (tabs: data, documents, absences, flags), `MyRecord.tsx` with DE/EN/VI keys

**Checkpoint**: US1 tests green; quickstart scenario 9 passes.

## Phase 4: User Story 2 – Eligibility check (P1) 🎯 MVP

**Goal**: One server-side check returns eligible / with warnings / not eligible with explained reasons.

**Independent Test**: Quickstart scenarios 1–8 and 10 pass.

### Tests for US2 (write first, must fail)

- [ ] T030 [P] [US2] Boundary-table test `backend/eligibility-engine/src/test/java/de/hsnv/engine/MaxAgeAtFirstUseTest.java`: IfSG §43 certificate exactly 3 months old at first food work → eligible; 3 months + 1 day → not eligible; later shifts eligible regardless of age; legacy Gesundheitszeugnis accepted
- [ ] T031 [P] [US2] `RepeatIntervalTest.java`: §43(4) re-instruction 24 months; due date exact, one day over
- [ ] T032 [P] [US2] `FixedExpiryTest.java`: residence title ends 15 Mar → 14 Mar eligible, 16 Mar not; shift 22:00–02:00 crossing expiry at midnight → not eligible; shifts on DST switch Sundays (last Sunday of March and October, Europe/Berlin)
- [ ] T033 [P] [US2] `InitialAndFollowUpTest.java`: JArbSchG §32 initial exam ≤ 14 months old; no §33 follow-up 14 months after start → not eligible; turns 18 on shift date → rule no longer applies
- [ ] T034 [P] [US2] `AgeAndAbsenceBlockTest.java`: age 14 → never eligible; birthday on shift date computed in branch zone; approved leave, sick leave, MuSchG protection period → `NOT_ELIGIBLE` with HARD reason
- [ ] T035 [P] [US2] `ScopeAndSeverityTest.java`: service role without food contact needs no IfSG certificate; SOFT reason gives `ELIGIBLE_WITH_WARNINGS`; `UNVERIFIED` document counts as missing
- [ ] T036 [P] [US2] Integration test `backend/app/src/test/java/de/hsnv/eligibility/EligibilityApiIT.java`: `/eligibility/check` and `/eligibility/check-batch` (≤ 2000 items, results in request order), `Accept-Language: vi` returns Vietnamese message with German legal term

### Implementation for US2

- [ ] T037 [US2] Rule evaluators in `backend/eligibility-engine/src/main/java/de/hsnv/engine/rules/` (`FixedExpiryRule`, `RepeatIntervalRule`, `MaxAgeAtFirstUseRule`, `InitialAndFollowUpRule`, `AgeBlockRule`, `AbsenceBlockRule`), each reading parameters from `RequirementVersion.params`
- [ ] T038 [US2] `EligibilityEngine.evaluate(...)` in `backend/eligibility-engine/src/main/java/de/hsnv/engine/EligibilityEngine.java`: select versions in force on each shift date and matching scope, evaluate every instant of the shift in the branch zone, aggregate status
- [ ] T039 [US2] Flyway `V4__requirements.sql`: `requirement_version` (scope_condition enum `ALL`,`UNDER_18`,`NON_EU`,`FOOD_CONTACT_ROLE`; severity `HARD`,`SOFT`; params jsonb; legal_source; effective_from required; "ranges of the same type+scope must not overlap" via exclusion constraint) and seed rows: `IFSG43_CERT` (MAX_AGE_AT_FIRST_USE 3, HARD, `IfSG §43(1)`), `IFSG43_REINSTRUCTION` (REPEAT_INTERVAL 24, HARD, `IfSG §43(4)`), `JARBSCHG_EXAM` (INITIAL_AND_FOLLOW_UP 14/14, HARD, UNDER_18, `JArbSchG §32/§33`), `RESIDENCE_TITLE` (FIXED_EXPIRY, HARD, NON_EU, `AufenthG §4a`), `LMHV_HYGIENE` (REPEAT_INTERVAL 12, SOFT, `LMHV §4`), `DGUV_SAFETY` (REPEAT_INTERVAL 12, SOFT, `DGUV Vorschrift 1 §4`), age block 15, absence blocks; all effective from 2026-01-01
- [ ] T040 [US2] `EligibilityAdapter` in `…/hsnv/eligibility/EligibilityAdapter.java`: load data in bulk (no N+1) → engine → DTO with localised `message` and `fix`
- [ ] T041 [US2] `EligibilityController` in `…/hsnv/eligibility/EligibilityController.java` for `/eligibility/check` and `/eligibility/check-batch`
- [ ] T042 [P] [US2] Message keys for every reason and fix in `messages_{de,en,vi}.properties` (German term kept, e.g. "Belehrung nach §43 IfSG")
- [ ] T043 [P] [US2] Frontend `frontend/src/pages/EligibilityCheck.tsx`: pick employee, role, branch, shift; show status badge and reasons list with source and fix

**Checkpoint**: MVP complete (US1 + US2); quickstart scenarios 1–10 pass.

## Phase 5: User Story 3 – Expiry warnings (P2)

**Goal**: Managers and employees see what expires or is due within a window (default 30 days).

**Independent Test**: Documents due in 10, 30, 60 days → only first two shown by default (quickstart 12).

- [ ] T044 [P] [US3] Integration test `backend/app/src/test/java/de/hsnv/expiry/ExpiryApiIT.java`: default 30 days, `withinDays` 1–365 validation, branch scoping, re-instruction 23 months ago shows "due in about 1 month"
- [ ] T045 [US3] `ExpiryService` in `…/hsnv/expiry/ExpiryService.java` computing next due dates via the same engine rule evaluators (no duplicate date logic)
- [ ] T046 [US3] `ExpiryController` for `GET /expiries` in `…/hsnv/expiry/ExpiryController.java`; include expiries in `/me/record`
- [ ] T047 [P] [US3] Frontend `frontend/src/pages/Expiries.tsx` (window selector, sort by days left, HARD items highlighted) and expiry section in `MyRecord.tsx`

## Phase 6: User Story 4 – Configure requirements (P2)

**Goal**: Admin adds requirement versions without code changes.

**Independent Test**: Add "allergen training, SOFT, yearly" for service; version effective 1 Jan applies to 1 Jan but not 31 Dec (quickstart 11).

- [ ] T048 [P] [US4] Integration test `backend/app/src/test/java/de/hsnv/requirement/RequirementApiIT.java`: create type + version, overlapping range → 409, non-admin → 403, params validated per rule type
- [ ] T049 [P] [US4] Engine test `backend/eligibility-engine/src/test/java/de/hsnv/engine/VersionBoundaryTest.java`: old version on 31 Dec, new on 1 Jan; shift crossing midnight 31 Dec → 1 Jan evaluated against both
- [ ] T050 [US4] `RequirementService` + `RequirementController` in `…/hsnv/requirement/` for `GET/POST /requirements` with params schema validation per `RuleType` and audit
- [ ] T051 [P] [US4] Frontend `frontend/src/pages/Requirements.tsx` (list versions by type, form with rule-type-specific params, legal source, effective dates)

## Phase 7: Polish & Cross-Cutting

- [ ] T052 [P] Performance test `backend/app/src/test/java/de/hsnv/eligibility/EligibilityPerfIT.java`: 10 branches, 300 employees; single check < 1 s, 300-pair batch < 2 s
- [ ] T053 [P] Retention job `…/hsnv/document/RetentionJob.java`: delete scans after `retention_until`, flag minors' certificates for return (JArbSchG §41)
- [ ] T054 [P] Check all UI strings exist in DE/EN/VI with a test `frontend/tests/i18n-keys.test.ts`
- [ ] T055 Run every scenario in `specs/001-staff-records-eligibility/quickstart.md` and record results in `specs/001-staff-records-eligibility/checklists/quickstart-run.md`

## Dependencies & Execution Order

- Phase 1 → Phase 2 → user stories. Phase 2 blocks everything.
- US1 (Phase 3) and the engine part of US2 (T030–T035, T037–T038) can run in parallel; US2 API tasks (T039–T041) need US1 entities (T022–T024).
- US3 needs US2 rule evaluators (T037). US4 needs T039.
- Polish after the stories it touches.

```text
Setup → Foundational ─┬─ US1 ─┬─ US2(API) ─┬─ US3
                      └─ US2(engine) ─┘    └─ US4 → Polish
```

## Parallel Examples

- **US1**: T019, T020, T021 together; then T023 and T024 together; T027 and T029 alongside T025/T026.
- **US2**: all engine tests T030–T035 together (one person per test file); T042 and T043 in parallel with T040/T041.
- **Team of 3**: A = engine (T030–T038), B = backend US1 (T019–T028), C = frontend (T017, T029, T043).

## Implementation Strategy

1. **MVP** = Phases 1–4 (US1 + US2): records plus the eligibility gate. Demo: a kitchen employee
   with an outdated §43 IfSG certificate is rejected with a reason in German, English and
   Vietnamese.
2. Add US3 (expiry warnings), then US4 (requirement configuration).
3. Next feature (002): shift planning with live validation, reusing `EligibilityEngine`.
