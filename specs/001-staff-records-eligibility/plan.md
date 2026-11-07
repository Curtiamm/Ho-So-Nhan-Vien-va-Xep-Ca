# Implementation Plan: Staff Records, Documents and Eligibility Gate

**Branch**: `001-staff-records-eligibility` | **Date**: 2026-11-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-staff-records-eligibility/spec.md`

## Summary

Build employee records with documents, trainings, protective flags and absences, plus one
server-side eligibility check that answers "may employee X work role R at branch B during shift
S?" with explained reasons in DE/EN/VI. Requirements are versioned data (type, scope, severity,
validity rule, legal source, effective dates). The eligibility engine is a plain-Java module with
no Spring, JPA or Timefold dependency so the planning and solver features can reuse it later.

## Technical Context

**Language/Version**: Java 21 (LTS); TypeScript 5 for the web client

**Primary Dependencies**: Spring Boot 3.5.x (Web, Data JPA, Security, Validation), Flyway,
springdoc-openapi; React 18 + Vite + react-i18next on the client. Timefold Solver is not used in
this feature (reserved for feature 004) but the engine module is designed for reuse by it.

**Storage**: PostgreSQL 16; document scans on local disk outside the web root behind a
`ScanStorage` interface (swappable for object storage later)

**Testing**: JUnit 5 + AssertJ (engine, parameterised boundary tables), Spring Boot Test +
Testcontainers PostgreSQL (integration), ArchUnit (module dependency rule), Vitest (client)

**Target Platform**: Linux server or Docker; modern desktop and mobile browsers

**Project Type**: Web application (backend REST API + SPA frontend)

**Performance Goals**: Eligibility answer for one shift < 1 s at 10 branches / 300 employees
(SC-004); batch check of a 7-day branch plan (≈ 300 shift-employee pairs) < 2 s

**Constraints**: All times as UTC `Instant` + branch zone `Europe/Berlin`; no hard-coded legal
values; scans only for "copy required" types; RBAC per branch; append-only audit log

**Scale/Scope**: ≤ 20 branches, ≤ 1,000 employees, ≈ 15 screens for this feature

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate for this feature | Status |
|-----------|----------------------|--------|
| I. Compliance by Construction | Single `EligibilityService` used by every caller; hard reasons not overridable (FR-013); server-side only | PASS |
| II. Eligibility Before Assignment | Seed requirements FR-009; evaluated at shift dates (FR-008); expiry warnings (FR-011) | PASS |
| III. Rules as Versioned Data | `requirement_type` + `requirement_version` with effective dates and legal source; no constants in engine | PASS |
| IV. One Constraint Model | Engine is a pure module reusable by the Timefold constraint provider (feature 004) | PASS (prepared) |
| V. Explainable + Audit | `Reason` carries rule, source §, severity, failing date/value, fix key; audit table append-only | PASS |
| VI. Test-First | Boundary tables written before engine code; DST, midnight, birthday, version-boundary cases | PASS |
| VII. Privacy (DSGVO) | Flags without medical data; scans restricted; retention fields; synthetic seed data | PASS |
| VIII. Trilingual | Reason messages and UI via message keys in `de`, `en`, `vi` | PASS |

Post-design re-check (after Phase 1): PASS. No violations; Complexity Tracking not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-staff-records-eligibility/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md             # created by /speckit-tasks
```

### Source Code (repository root)

```text
backend/
├── pom.xml                          # multi-module parent
├── eligibility-engine/              # plain Java 21, no framework deps
│   ├── src/main/java/.../engine/    # model, rules, EligibilityEngine, Reason
│   └── src/test/java/.../engine/    # boundary-table tests
├── app/                             # Spring Boot application
│   ├── src/main/java/.../
│   │   ├── employee/                # entities, repos, services, controllers
│   │   ├── document/
│   │   ├── requirement/
│   │   ├── eligibility/             # adapter: loads data → engine → DTO
│   │   ├── audit/
│   │   ├── security/                # roles Admin / BranchManager / Employee
│   │   └── i18n/
│   ├── src/main/resources/
│   │   ├── db/migration/            # Flyway V1__..., seed requirement data
│   │   └── i18n/messages_{de,en,vi}.properties
│   └── src/test/java/.../           # integration + ArchUnit tests
frontend/
├── src/
│   ├── pages/                       # employees, employee detail, expiries, requirements, my-records
│   ├── components/
│   ├── api/                         # generated from contracts/openapi.yaml
│   └── locales/{de,en,vi}.json
└── tests/
```

**Structure Decision**: Web application with a separate `eligibility-engine` Maven module so
the rule logic is framework-free (Principle IV/VI) and enforced by an ArchUnit test.

## Complexity Tracking

No violations.
