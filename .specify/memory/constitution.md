<!--
Sync Impact Report
- Version change: template (unversioned) → 1.0.0 (initial adoption)
- Principles defined:
  I. Compliance by Construction (NON-NEGOTIABLE)
  II. Eligibility Before Assignment (NON-NEGOTIABLE)
  III. Rules Are Versioned, Sourced Data
  IV. One Constraint Model, Three Planning Modes
  V. Explainable Decisions and Full Audit Trail
  VI. Test-First Rule Engine (NON-NEGOTIABLE)
  VII. Privacy by Design (DSGVO)
  VIII. Trilingual by Default (DE / EN / VI)
- Added sections: Regulatory Baseline (seed rule set 2026-11); Technology Stack and
  Development Workflow; Governance
- Removed sections: none
- Templates: plan-template.md, spec-template.md and tasks-template.md read this file at runtime;
  no template edits required.
- Deferred TODOs:
  TODO(DATABASE): relational database choice deferred to /speckit-plan.
  TODO(FRONTEND): web UI framework choice deferred to /speckit-plan.
  TODO(TARIFVERTRAG): whether the client restaurant(s) are bound by a hospitality collective
  agreement is unknown; seed rule set assumes NOT bound (statutory defaults only).
  TODO(BUNDESLAND): Bundesland of each branch unknown; holiday calendars configured per branch.
-->

# Staff Records & Shift Scheduling (DT05) Constitution

Project: employee records with expiring documents and mandatory trainings, demand-based shift
planning per branch, automatic checks of German working-time law, an employee schedule view and
shift-swap requests, for a restaurant chain (or a single restaurant) in Germany.

## Core Principles

### I. Compliance by Construction (NON-NEGOTIABLE)

Every change that puts a person on a shift MUST pass through one shared compliance validator:
manual assignment, solver suggestion, open-shift claim, shift-swap approval and plan publication.

- Hard rules (statutory limits from ArbZG, JArbSchG, MuSchG, AufenthG and the eligibility gate
  in Principle II) MUST block the change. No role, API endpoint, import or batch job may bypass
  them.
- Soft rules (staffing demand, fairness, preferences, company policy, statutory "should"
  provisions such as ArbZG §11(4)) MAY be overridden only by a Branch Manager or Admin who enters
  a written reason; the override is stored in the audit log.
- A plan containing any hard violation MUST NOT be publishable.
- A shift swap MUST re-validate both employees against all their rules before approval and MUST
  require manager approval; employees cannot waive legal limits by mutual consent.
- The validator MUST run on the server; client-side checks are a convenience only.

Rationale: the brief requires that ineligible people are never scheduled and that branch demand
is balanced against German working-time law. ArbZG violations carry fines up to EUR 30,000 per
offence (§22), food work without the IfSG certificate up to EUR 25,000 (IfSG §73), and employing
someone without a valid work permit up to EUR 500,000 (SGB III §404).

### II. Eligibility Before Assignment (NON-NEGOTIABLE)

An employee is eligible for a shift only if every requirement attached to the shift's role and
branch and to the employee's category is present and valid on the shift date. Seed requirements:

- §43 IfSG certificate (Gesundheitsamt Belehrung) for anyone whose tasks involve food contact:
  kitchen, dishwashing, and service or bar staff who handle open food. At first food work it MUST
  be no older than 3 months; afterwards it does not expire. The employer re-instruction under
  §43(4) IfSG is required at start and every 2 years.
- Children under 15 and anyone still in full-time compulsory schooling MUST NOT be scheduled
  (Kinderarbeitsschutzverordnung is not modelled).
- Employees under 18: initial medical examination (JArbSchG §32, not older than 14 months);
  without the follow-up examination (§33) presented within 14 months of starting, no further
  employment.
- Non-EU staff: a valid residence title permitting the work (AufenthG §4a); non-EU students
  additionally within the 140-working-day annual limit (AufenthG §16b(3)).
- Maternity protection periods (MuSchG §3) make the employee ineligible for the whole period.
- Further requirements the business configures (e.g. annual food-hygiene training under LMHV §4,
  annual safety instruction under DGUV Vorschrift 1 §4) as hard or soft per configuration.

Validity MUST be evaluated against the shift date, not today's date. The system MUST warn before
expiry (default 30 days, configurable) and MUST show why a person is ineligible. Coverage rules
(e.g. at least one trained first aider per branch and shift, DGUV Vorschrift 1 §26) are evaluated
per shift, not per employee.

### III. Rules Are Versioned, Sourced Data

Legal and contractual limits MUST NOT be hard-coded as constants in business logic.

- Each rule is stored as data with: rule type, parameters, legal source (law and §), scope
  (country, Bundesland, branch, contract type, employee category, collective agreement), severity
  (hard / soft) and validity period (effective-from / effective-to).
- A shift is always validated against the rule-set version in force on the shift date.
- Changing a limit (ArbZG reform, new minimum wage or mini-job limit, a collective agreement)
  MUST be possible by adding a new rule-set version without a code change, as long as the rule
  type exists.
- Any deviation from a statutory default (e.g. 10 Sundays instead of 15, 9 h rest) MUST
  reference the collective agreement or works agreement that allows it.
- The ArbZG weekly-maximum model is a draft as of November 2026 (not law). It MAY be implemented
  only as a disabled-by-default rule mode that requires a stored collective-agreement reference.
- Public holidays MUST be resolved from the Bundesland (and municipality where relevant) of the
  branch.

### IV. One Constraint Model, Three Planning Modes

Manual planning, automatic schedule suggestion and validation MUST share one constraint model.

- Timefold constraints map rule severities: hard rules → hard score; uncovered staffing demand →
  medium score; fairness and preferences → soft score.
- Solver output is a proposal, never a decision. It MUST be re-checked by the same validator used
  for manual edits before it is shown as valid; the planner MUST be able to accept, edit or reject
  each proposed assignment.
- Pinned (manually fixed) assignments MUST be respected by the solver.
- The validator MUST work without the solver, so manual planning works when solving is slow,
  disabled or fails. Solving MUST run asynchronously with a configurable time limit.

### V. Explainable Decisions and Full Audit Trail

- Every violation and every ineligibility MUST state: the rule name, its legal or policy source
  (with §), the employee and shift(s) concerned, the measured value versus the limit, and at least
  one suggested fix where one can be derived.
- Messages MUST be available in German, English and Vietnamese (Principle VIII).
- The following MUST be written to an append-only audit log with actor, timestamp, before/after
  values and reason: assignments, overrides, swap requests and decisions, plan publication and
  changes after publication, document and training changes, and rule-set changes.
- Actual working time (start, end, duration) MUST be recordable per shift and re-checkable against
  the rules: restaurants must record it by the end of the 7th day and keep it 2 years
  (MiLoG §17 with SchwarzArbG §2a; ArbZG §16(2); BAG 1 ABR 22/21).

### VI. Test-First Rule Engine (NON-NEGOTIABLE)

- Every rule type MUST have automated tests written before or with its implementation, covering at
  least: exactly at the limit, one minute over, shifts crossing midnight, split shifts, the
  Europe/Berlin daylight-saving switches, rolling windows (day, week, double week, month,
  averaging period, calendar year) and rule-set version boundaries.
- Times MUST be stored as UTC instants plus the branch time zone (Europe/Berlin) and computed with
  `java.time` (`Instant`, `ZonedDateTime`); `LocalDateTime` MUST NOT be used for duration
  arithmetic.
- The solver MUST have tests on small fixed datasets proving it never returns an assignment that
  the validator rejects as a hard violation.
- A pull request that changes rule logic MUST NOT be merged while any rule test fails.

### VII. Privacy by Design (DSGVO)

- Store the minimum needed to decide eligibility: document type, issue and expiry dates,
  verification status and verifier. Keep scans or copies only where the law requires the employer
  to hold one (IfSG §43 certificate, AufenthG §4a(5) permit copy, JArbSchG §41 medical
  certificates) and restrict them to authorised roles.
- Special-category data (GDPR Art. 9) MUST be reduced to protective flags with validity periods,
  e.g. "MuSchG applies", "night work until 22:00 approved", "SGB IX §207 overtime exemption";
  no diagnoses or medical details are stored.
- Legal basis is GDPR Art. 6(1)(b)/(c) and Art. 9(2)(b); BDSG §26(1) MUST NOT be cited as the
  basis (EuGH C-34/21; BAG 8 AZR 209/21).
- Every personal data category MUST have a defined retention and deletion rule (e.g. time records
  at least 2 years; minors' certificates returned at end of employment, JArbSchG §41). Employees
  MUST be able to view their own records.
- Role-based access control MUST limit data to what each role needs: Admin (head office), Branch
  Manager (own branch only), Employee (own data and own schedule).
- Development and demo data MUST be synthetic; no real personal data in the repository.

### VIII. Trilingual by Default (DE / EN / VI)

- The UI MUST support German, English and Vietnamese. All user-facing strings MUST come from
  message bundles; no hard-coded UI text. A feature is not done until its keys exist in all three
  languages.
- Dates, times and numbers MUST be formatted per the selected locale; weeks start on Monday.
- German legal terms (e.g. Ruhezeit, Belehrung nach §43 IfSG) MUST be shown with the original
  German term alongside the translation.
- Project documentation is written in English as the canonical version, with Vietnamese and German
  translations. If translations disagree, the English text prevails.

## Regulatory Baseline (Seed Rule Set 2026-11)

These are the statutory default values used to seed rule-set version `2026-11`. They are data, not
code (Principle III). Source: research report "Luật xếp ca nhà hàng Đức" (November 2026). Values
MUST be re-checked against official texts before any real-world use.

| Area | Default rule (hospitality, no collective agreement) | Source | Severity |
|------|------------------------------------------------------|--------|----------|
| Daily max | 8 h per Werktag (Mon–Sat); up to 10 h if average ≤ 8 h over 6 calendar months / 24 weeks | ArbZG §3 | Hard: 10 h cap; 8 h average: warning until the period closes |
| Breaks | ≥ 30 min if > 6 h, ≥ 45 min if > 9 h; blocks ≥ 15 min; ≤ 6 h without break | ArbZG §4 | Hard |
| Rest | 11 h between shifts; hospitality 10 h if offset by ≥ 12 h rest within 1 month / 4 weeks; 11 h after any day > 12 h | ArbZG §5(1)(2), §7(9) | Hard |
| Night | Night time 23:00–06:00; night workers 8 h/day, 10 h only if averaged within 1 month / 4 weeks | ArbZG §2, §6 | Hard |
| Sundays | ≥ 15 work-free Sundays per year (≥ 10 only via collective agreement); substitute rest day within 2 weeks (Sunday) / 8 weeks (holiday) | ArbZG §11, §12 | Hard |
| Sunday rest + 11 h | Substitute rest day should join an 11 h rest | ArbZG §11(4) | Soft |
| Split shifts | Allowed; all blocks summed for the daily limit; rest counted from the last block | ArbZG §3, §5 (contested in practice) | Hard (sums) |
| Minors | 8 h/day, 40 h/week, 5-day week; breaks 30/60 min; Schichtzeit 11 h in hospitality; 12 h rest; 06:00–20:00 (≥ 16 y: until 22:00); ≥ 2 free Sundays/month; holiday bans (25 Dec, 1 Jan, Easter Sunday, 1 May; 24/31 Dec after 14:00) | JArbSchG §§8, 11–18 | Hard |
| MuSchG | 8.5 h/day, 90 h per double week (under 18: 8 h / 80 h); no work 20:00–06:00 unless approved until 22:00; Sunday/holiday only with consent; 11 h rest | MuSchG §§3–6, §28 | Hard |
| Disability | Overtime only if the employee has not requested exemption | SGB IX §207 | Hard when flagged |
| Minijob | Earnings ≤ EUR 603/month in 2026 (EUR 633 in 2027) at minimum wage EUR 13.90 (2026) / EUR 14.60 (2027) | SGB IV §8, MiLoG | Soft warning per month |
| Werkstudent | ≤ 20 h/week during term (exceptions: breaks, evenings/weekends) | BSG case law | Soft warning |
| On-call work | Shifts announced ≥ 4 days ahead; minimum call 3 h | TzBfG §12 | Hard for on-call contracts |
| Plan notice | No statutory deadline; ≥ 4 days for on-call; company default 14 days | GewO §106, practice | Soft |

Works-council note: where a Betriebsrat exists, shift plans (BetrVG §87(1) Nr. 2/3) and the
scheduling software itself (§87(1) Nr. 6) require its consent. The product MUST make plan
approval steps configurable for this.

## Technology Stack and Development Workflow

- Backend: Java (current LTS, 21 or newer) with Spring Boot; Timefold Solver for schedule
  suggestion. TODO(DATABASE) and TODO(FRONTEND) are decided in `/speckit-plan`.
- Employee views (own schedule, availability, swap requests) MUST work on mobile browsers
  (responsive web; PWA optional).
- Architecture: the rule engine and validator live in a module with no dependency on web,
  persistence or solver code, so it can be unit-tested and reused by the solver.
- Workflow per feature: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement`. Every spec MUST list the rules it touches.
- Scope order: (1) employee records, documents and eligibility; (2) branch demand and manual
  planning with live validation; (3) employee schedule view and swap requests; (4) automatic
  schedule suggestion with Timefold; (5) fairness reports and rule-set versioning UI. A later
  stage MUST NOT start before the earlier stage passes its acceptance tests.
- Code review: every pull request is reviewed by at least one other team member; CI runs all
  tests on every pull request.
- Definition of Done: acceptance criteria met, rule tests green, i18n keys in DE/EN/VI, audit
  events emitted, no hard-coded legal values, documentation updated.

## Governance

- This constitution supersedes other project practices. Every `/speckit-plan` MUST include a
  Constitution Check against Principles I–VIII; any deviation MUST be justified in the plan's
  Complexity Tracking section.
- Amendments: proposed as a pull request that edits this file and its VI/DE translations, approved
  by a majority of team members, and recorded with a new version and date.
- Versioning: MAJOR for removing or redefining a principle; MINOR for a new principle or section
  or materially expanded guidance; PATCH for wording and clarifications.
- Changes to legal values belong in rule-set data, not in this constitution, unless they change a
  principle.
- Compliance review: reviewers check pull requests against the principles; the team reviews this
  constitution at the start of each sprint.
- This project is a student project and does not constitute legal advice. Legal values MUST be
  verified against official texts (gesetze-im-internet.de) before production use.

**Version**: 1.0.0 | **Ratified**: 2026-11-07 | **Last Amended**: 2026-11-07
