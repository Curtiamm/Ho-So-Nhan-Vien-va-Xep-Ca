# Research: Staff Records, Documents and Eligibility Gate

Legal background: `reports/Luật xếp ca nhà hàng Đức.md` (Nov 2026). This file records technical
decisions that resolve the TODOs left in the constitution.

## D1 Database (resolves TODO(DATABASE))

- **Decision**: PostgreSQL 16 with Flyway migrations.
- **Rationale**: Strong date/time types (`timestamptz`, `daterange`) for validity periods,
  exclusion constraints usable later for overlapping shifts, free, first-class Testcontainers
  support; Flyway keeps seed requirement data versioned with the code.
- **Alternatives**: MySQL (team knows it from earlier projects, weaker range types); H2 (only for
  quick demos, behaviour differs from production).

## D2 Frontend (resolves TODO(FRONTEND))

- **Decision**: React 18 + Vite + TypeScript SPA, react-i18next for DE/EN/VI, responsive layout
  for the employee views.
- **Rationale**: Team already used React/Next.js; SPA calls the REST API defined in
  `contracts/openapi.yaml`; easy mobile-friendly views; i18n library supports locale formatting.
- **Alternatives**: Thymeleaf server-rendered (one codebase, but weaker for later drag-and-drop
  planning board); Next.js (SSR not needed for an internal tool).

## D3 Spring Boot version and Timefold compatibility

- **Decision**: Spring Boot 3.5.x for now.
- **Rationale**: Timefold Solver's Spring Boot starter is documented against Spring Boot 3; this
  feature does not use Timefold, so the choice can be revisited before feature 004.
- **To verify before feature 004**: Timefold version supporting the chosen Boot line, pinning
  support and score explanation API, licence of the Community edition (flagged unverified in the
  research report).

## D4 Engine shape

- **Decision**: Pure function `EligibilityEngine.evaluate(EmployeeSnapshot, ShiftRequest,
  List<RequirementVersion>, List<DocumentRecord>, List<Absence>, List<ProtectiveFlag>) →
  EligibilityResult`.
- **Rationale**: Deterministic, unit-testable without DB, reusable inside Timefold constraint
  streams by precomputing per employee/shift eligibility.
- **Alternatives**: Drools rule engine (heavy, rule language to learn); hard-coded `if` chains
  (violates Principle III).

## D5 Validity rule types (data, not code constants)

| Rule type | Parameters | Example |
|-----------|------------|---------|
| `FIXED_EXPIRY` | — (uses document expiry date) | Residence title |
| `REPEAT_INTERVAL` | `months` | §43(4) IfSG re-instruction: 24 |
| `MAX_AGE_AT_FIRST_USE` | `months`, then unlimited | §43 IfSG certificate: 3 |
| `INITIAL_AND_FOLLOW_UP` | `initialMaxAgeMonths`, `followUpDueMonths` | JArbSchG §32/§33: 14 / 14 |
| `AGE_BLOCK` | `minAgeYears` | Children: 15 |
| `ABSENCE_BLOCK` | absence kinds | Approved leave, sick leave, MuSchG §3 |

New rule types need code; new requirements or changed parameters do not.

## D6 Time handling

- **Decision**: Shift start/end stored as `timestamptz` (UTC); branch has `zone_id`
  (`Europe/Berlin`); dates such as birthdays and validity dates are `LocalDate` evaluated in the
  branch zone; a shift is eligible only if every instant of it is covered.
- **Rationale**: Principle VI; avoids DST and midnight errors.

## D7 Scan storage

- **Decision**: Files on disk outside web root via `ScanStorage` interface, served only through an
  authorised download endpoint; file name is a random UUID; max 10 MB; PDF/JPEG/PNG only.
- **Alternatives**: Database BLOB (bloats backups); cloud object storage (extra setup for a student
  project; interface allows later switch).

## D8 Authentication and RBAC

- **Decision**: Spring Security session login (username/password, BCrypt); roles ADMIN,
  BRANCH_MANAGER (scoped to branch ids), EMPLOYEE (scoped to own employee id); method-level checks
  in services, not only controllers.

## D9 Audit log

- **Decision**: `audit_event` table, insert-only (DB role without UPDATE/DELETE on it), JSON
  before/after, written in the same transaction as the change.
