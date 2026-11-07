# Data Model: Staff Records, Documents and Eligibility Gate

All timestamps UTC (`timestamptz`); calendar dates are `date` interpreted in the branch zone.

## branch

| Field | Type | Rules |
|-------|------|-------|
| id | uuid | PK |
| name | text | required, unique |
| bundesland | text | ISO code (e.g. `DE-BY`), required |
| zone_id | text | default `Europe/Berlin` |

## role

| Field | Type | Rules |
|-------|------|-------|
| code | text | PK (`KITCHEN`, `SERVICE`, `SERVICE_OPEN_FOOD`, `BAR`, `DISHWASHING`, `CLEANING`, `MANAGEMENT`) |
| food_contact | boolean | drives IfSG §43 requirement |
| name_key | text | i18n key |

## employee

| Field | Type | Rules |
|-------|------|-------|
| id | uuid | PK |
| first_name, last_name | text | required |
| date_of_birth | date | required; age < 15 → never eligible |
| eu_status | enum `EU_EEA`, `NON_EU` | required; no other nationality data |
| contract_type | enum `FULL_TIME`, `PART_TIME`, `MINIJOB`, `WERKSTUDENT`, `APPRENTICE`, `ON_CALL` | required |
| contracted_hours_per_week | numeric(4,1) | ≥ 0 |
| start_date | date | required |
| first_food_work_date | date | nullable; set when first food-contact shift is worked |
| active | boolean | default true |
| retention_until | date | set on deactivation |

Relations: `employee_branch(employee_id, branch_id)`, `employee_role(employee_id, role_code)`.

## requirement_type

| Field | Type | Rules |
|-------|------|-------|
| code | text | PK, e.g. `IFSG43_CERT`, `IFSG43_REINSTRUCTION`, `JARBSCHG_EXAM`, `RESIDENCE_TITLE`, `LMHV_HYGIENE`, `DGUV_SAFETY`, `FIRST_AID` |
| name_key | text | i18n key |
| copy_required | boolean | allows scan upload (FR-003) |

## requirement_version

| Field | Type | Rules |
|-------|------|-------|
| id | uuid | PK |
| requirement_type_code | text | FK |
| scope_roles | text[] | null = all roles |
| scope_branches | uuid[] | null = all branches |
| scope_condition | enum `ALL`, `UNDER_18`, `NON_EU`, `FOOD_CONTACT_ROLE` | |
| severity | enum `HARD`, `SOFT` | |
| rule_type | enum (see research D5) | |
| params | jsonb | validated per rule_type |
| legal_source | text | e.g. `IfSG §43(1)` |
| effective_from | date | required |
| effective_to | date | nullable; ranges of the same type+scope must not overlap |

## document_record

| Field | Type | Rules |
|-------|------|-------|
| id | uuid | PK |
| employee_id | uuid | FK |
| requirement_type_code | text | FK |
| issue_date | date | required for verification |
| expiry_date | date | required for `FIXED_EXPIRY` types |
| status | enum `UNVERIFIED`, `VERIFIED`, `REJECTED` | only VERIFIED counts |
| verified_by, verified_at | uuid, timestamptz | set on verification |
| scan_ref | text | only if type.copy_required |
| legacy_equivalent | boolean | e.g. old Gesundheitszeugnis accepted for IFSG43_CERT |

State: `UNVERIFIED → VERIFIED | REJECTED`; edits to dates reset to `UNVERIFIED`.

## protective_flag

| Field | Type | Rules |
|-------|------|-------|
| id, employee_id | uuid | |
| kind | enum `MUSCHG`, `MUSCHG_NIGHT_22_APPROVED`, `SGBIX_207_EXEMPTION` | no free text |
| valid_from, valid_to | date | |

## absence

| Field | Type | Rules |
|-------|------|-------|
| id, employee_id | uuid | |
| kind | enum `APPROVED_LEAVE`, `SICK_LEAVE`, `MUSCHG_PROTECTION_PERIOD` | all HARD blocks |
| start_date, end_date | date | inclusive; end ≥ start |

## audit_event (insert-only)

| Field | Type |
|-------|------|
| id | bigserial |
| occurred_at | timestamptz |
| actor_user_id | uuid |
| entity_type, entity_id | text, uuid |
| action | enum `CREATE`, `UPDATE`, `DELETE`, `VERIFY`, `DOWNLOAD_SCAN` |
| before, after | jsonb |

## user_account

| Field | Type |
|-------|------|
| id | uuid |
| username, password_hash | text |
| role | enum `ADMIN`, `BRANCH_MANAGER`, `EMPLOYEE` |
| branch_ids | uuid[] (managers) |
| employee_id | uuid (employees) |
| locale | enum `de`, `en`, `vi` |

## EligibilityResult (computed, not stored)

- `status`: `ELIGIBLE` | `ELIGIBLE_WITH_WARNINGS` | `NOT_ELIGIBLE`
- `reasons[]`: `ruleCode`, `legalSource`, `severity`, `failingDate`, `measured`, `limit`,
  `messageKey`, `fixKey`, `args`
