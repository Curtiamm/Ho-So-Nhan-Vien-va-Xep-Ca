# Feature Specification: Staff Records, Documents and Eligibility Gate

**Feature Branch**: `001-staff-records-eligibility`

**Created**: 2026-11-07

**Status**: Draft

**Input**: User description: "Hồ sơ nhân viên, giấy tờ và cổng điều kiện (Employee records, documents & trainings with expiry, eligibility gate)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Maintain employee records with documents and trainings (Priority: P1)

A head-office Admin or a Branch Manager creates an employee record (name, date of birth, branch,
roles such as kitchen, service, bar, dishwashing, contract type and contracted hours) and records
each required document or training: type, issue date, expiry or repeat date, verification status
and who verified it. Where the law requires the employer to keep a copy (IfSG §43 certificate,
work-permit copy under AufenthG §4a(5), JArbSchG medical certificates), a scan can be attached.

**Why this priority**: Without employee and document data there is nothing to check; every later
feature (planning, solver, swaps) depends on it.

**Independent Test**: Create an employee with roles and documents, reload the record and confirm
all data and the attached scan are shown to authorised roles only.

**Acceptance Scenarios**:

1. **Given** a Branch Manager of branch A, **When** they create an employee for branch A with role
   "kitchen" and an IfSG §43 certificate dated 2 months ago, **Then** the record is saved and the
   certificate appears with its status "valid".
2. **Given** a Branch Manager of branch A, **When** they try to open an employee of branch B,
   **Then** access is denied.
3. **Given** an employee user, **When** they open "My records", **Then** they see their own data and
   document statuses but cannot edit verification status.

---

### User Story 2 - Check whether an employee may work a given shift (Priority: P1)

When anyone (or any later feature) asks "may employee X work as role R at branch B on date D?",
the system answers eligible / not eligible and lists every reason with the rule name, its legal
or policy source (with §), the date it fails, and how to fix it. The answer is shown in German,
English or Vietnamese.

**Why this priority**: This is the eligibility gate required by the brief ("không cho xếp ca người
chưa đủ điều kiện") and Constitution Principle II; planning, solver and swaps will call it.

**Independent Test**: With seeded employees and rules, query eligibility for several role/date
combinations and compare to the expected answers table.

**Acceptance Scenarios**:

1. **Given** a kitchen employee whose IfSG §43 certificate was issued 4 months before their first
   food-handling shift, **When** eligibility for that shift is checked, **Then** the result is
   "not eligible" with reason "Belehrung nach §43 IfSG older than 3 months at first food work".
2. **Given** a service employee with role "service (no open food)", **When** eligibility is checked
   with no IfSG certificate on file, **Then** the result is "eligible".
3. **Given** a non-EU employee whose residence title expires on 15 March, **When** eligibility is
   checked for 14 March and for 16 March, **Then** 14 March is eligible and 16 March is not.
4. **Given** an employee aged 17 who started 15 months ago and has no follow-up examination
   (JArbSchG §33), **When** eligibility is checked for tomorrow, **Then** the result is "not eligible".
5. **Given** an employee with an approved leave or sick-leave period, **When** eligibility is
   checked for a date inside it, **Then** the result is "not eligible" and no override is offered.
6. **Given** a 14-year-old record, **When** eligibility is checked for any date, **Then** the result
   is "not eligible" (children under 15 are never schedulable).

---

### User Story 3 - Expiry warnings and compliance overview (Priority: P2)

Branch Managers see a list of documents and trainings that expire (or need repeating) within a
warning window (default 30 days, configurable), and a per-branch overview of who is currently
eligible for each role. Employees see their own upcoming expiries.

**Why this priority**: Prevents last-minute gaps in the schedule; valuable but the gate in Story 2
already protects against violations.

**Independent Test**: Seed documents expiring in 10, 30 and 60 days and confirm only the first two
appear with the default window.

**Acceptance Scenarios**:

1. **Given** an employer re-instruction under §43(4) IfSG last done 23 months ago, **When** the
   manager opens the expiry list, **Then** it shows "due in about 1 month".
2. **Given** the warning window is changed to 60 days, **When** the list is reopened, **Then**
   documents expiring within 60 days appear.

---

### User Story 4 - Configure document requirements per role and branch (Priority: P2)

An Admin defines which document or training types are required for which roles, branches and
employee categories, whether each is blocking (hard) or warning (soft), its validity rule (fixed
expiry, repeat interval, "max age at first use") and its legal source and effective dates.

**Why this priority**: Constitution Principle III requires requirements to be data, so new rules
or changed intervals need no code change.

**Independent Test**: Add a new requirement "allergen training, soft, yearly" for role "service",
then check that eligibility for a service employee without it returns "eligible with warning".

**Acceptance Scenarios**:

1. **Given** a new requirement version effective from 1 January, **When** eligibility is checked
   for 31 December and 1 January, **Then** the old version applies to 31 December and the new one
   to 1 January.

---

### Edge Cases

- A document expires in the middle of a shift that crosses midnight: eligibility is evaluated for
  the whole shift period; the shift is not eligible if any part falls after expiry.
- An employee turns 18 (or 16) on the shift date: the age is computed for the shift date in the
  branch time zone.
- An employee works for two branches: documents are shared across branches; branch-specific
  requirements are checked against the branch of the shift.
- A scan is uploaded but dates are missing: the document stays "unverified" and counts as missing.
- An old "Gesundheitszeugnis" (pre-2001) is entered: it is accepted as a valid IfSG §43 equivalent.
- Requirement data is changed while an employee is already scheduled: affected future assignments
  are flagged for review (handled by the planning feature; this feature exposes the change event).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST let Admins and Branch Managers create, edit and deactivate employee
  records with: name, date of birth, branch(es), roles, contract type (full-time, part-time,
  Minijob, Werkstudent, apprentice, on-call), contracted hours, start date and nationality group
  (EU/EEA vs non-EU, no other nationality data).
- **FR-002**: System MUST store per employee any number of documents/trainings with type, issue
  date, expiry or next-due date, verification status, verifier and verification date.
- **FR-003**: System MUST allow attaching a scan only for document types marked "employer must
  keep a copy"; scans MUST be visible only to Admins and the employee's Branch Manager.
- **FR-004**: System MUST store protective flags (e.g. "MuSchG applies" with dates, "SGB IX §207
  overtime exemption requested") without any diagnosis or medical detail.
- **FR-005**: System MUST store absences (approved leave, sick leave, maternity protection period)
  with start and end dates.
- **FR-006**: System MUST provide one eligibility check: input employee, role, branch and shift
  start/end; output eligible, eligible-with-warnings or not eligible, plus a list of reasons.
- **FR-007**: Each reason MUST contain rule name, legal or policy source with §, severity
  (hard/soft), the failing date and value, and a suggested fix, in DE, EN and VI.
- **FR-008**: Eligibility MUST be evaluated against the shift dates and the requirement version in
  force on those dates, never against today's date.
- **FR-009**: Seed requirements MUST include: IfSG §43 certificate (max 3 months old at first food
  work, then unlimited) for food-contact roles; employer re-instruction §43(4) IfSG every 2 years;
  JArbSchG §32/§33 examinations for under-18s; valid residence title for non-EU staff; maternity
  protection periods; approved leave and sick leave; block for children under 15.
- **FR-010**: Admins MUST be able to add or change requirement types and versions (scope, severity,
  validity rule, legal source, effective-from/to) without a code change.
- **FR-011**: System MUST list upcoming expiries within a configurable window (default 30 days)
  per branch and per employee.
- **FR-012**: Every create/update/delete of employees, documents, flags, absences and requirement
  versions MUST be written to the audit log with actor, time, before/after values.
- **FR-013**: Hard reasons MUST NOT be overridable by any role; soft reasons are reported only
  (overrides are handled in the planning feature).
- **FR-014**: Employees MUST be able to view their own record, documents and upcoming expiries.
- **FR-015**: All user-facing text MUST be available in German, English and Vietnamese, with German
  legal terms shown alongside translations.

### Key Entities

- **Employee**: person employed by the chain; date of birth, branches, roles, contract type,
  contracted hours, start date, EU/non-EU flag, active status.
- **Branch**: restaurant location with Bundesland and time zone.
- **Role**: kind of work (kitchen, service, bar, dishwashing, cleaning, management) with a
  "food contact" attribute.
- **Document/Training record**: an employee's instance of a requirement type with dates, status,
  verifier and optional scan.
- **Requirement type and version**: what is required, for which scope, severity, validity rule,
  legal source and effective period.
- **Protective flag**: dated marker that triggers stricter rules, with no medical content.
- **Absence**: approved leave, sick leave or protection period with dates.
- **Eligibility result**: answer for one employee/role/branch/shift with reasons (computed, not
  stored, except when referenced by the audit log).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a test set of at least 50 employee/shift combinations covering every seed rule
  and edge case above, 100% of eligibility answers match the expected answers.
- **SC-002**: A manager can register a new employee with three documents in under 5 minutes.
- **SC-003**: A manager sees why an employee is not eligible, and what to do, without leaving the
  screen, in 100% of "not eligible" cases (every result has at least one reason and one fix).
- **SC-004**: An eligibility answer for one shift appears in under 1 second for a chain of
  10 branches and 300 employees.
- **SC-005**: Adding a new requirement type with a new interval takes an Admin under 3 minutes and
  no software release.
- **SC-006**: No user can see another branch's employees or any scan they are not authorised for
  (verified by role-based access tests).

## Assumptions

- Roles: Admin (head office), Branch Manager (own branch), Employee (own data). Login uses a
  standard username/password session; single sign-on is out of scope.
- The client is not bound by a hospitality collective agreement; statutory defaults apply.
- Annual food-hygiene training (LMHV §4) and annual safety instruction (DGUV Vorschrift 1 §4) are
  seeded as soft requirements; businesses may switch them to hard.
- First-aider and fire-safety coverage per shift is a coverage rule handled by the planning
  feature; this feature only records the trainings.
- Werkstudent enrolment certificates are stored as informational documents (non-blocking).
- Retention: documents are kept for the duration of employment, then deleted after the statutory
  period; minors' medical certificates are returned at the end of employment (JArbSchG §41).
- Working-time rules (ArbZG, JArbSchG hours, MuSchG hours) are out of scope here and belong to the
  next feature, "Shift planning with live validation".
