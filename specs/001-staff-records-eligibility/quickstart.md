# Quickstart: Staff Records, Documents and Eligibility Gate

## Prerequisites

- JDK 21, Maven 3.9+, Node 20+, Docker (for PostgreSQL and Testcontainers)
- Windows: run scripts in Git Bash or WSL

## Setup

```bash
docker run -d --name hsnv-db -e POSTGRES_DB=hsnv -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:16
cd backend && mvn -q verify            # engine + integration + ArchUnit tests
mvn -pl app spring-boot:run -Dspring-boot.run.profiles=dev   # loads synthetic seed data
cd ../frontend && npm install && npm run dev
```

## Validation scenarios

Seed data (profile `dev`): 2 branches (Bayern, Berlin), users `admin`, `manager.muenchen`,
`emp.anna`, all with password `dev`; synthetic employees only.

| # | Scenario (spec reference) | Expected |
|---|---------------------------|----------|
| 1 | Kitchen employee, IfSG §43 certificate issued 4 months before first food shift (US2-1) | `NOT_ELIGIBLE`, reason `IFSG43_CERT`, source `IfSG §43(1)` |
| 2 | Service role without open food, no IfSG certificate (US2-2) | `ELIGIBLE` |
| 3 | Non-EU employee, residence title ends 15 Mar; check 14 Mar and 16 Mar (US2-3) | 14 Mar `ELIGIBLE`, 16 Mar `NOT_ELIGIBLE` |
| 4 | 17-year-old, started 15 months ago, no follow-up exam (US2-4) | `NOT_ELIGIBLE`, `JArbSchG §33` |
| 5 | Shift inside approved leave (US2-5) | `NOT_ELIGIBLE`, no override possible |
| 6 | 14-year-old record (US2-6) | `NOT_ELIGIBLE`, `AGE_BLOCK` |
| 7 | Shift 22:00–02:00 crossing document expiry at midnight (edge case) | `NOT_ELIGIBLE` |
| 8 | Shift on the last Sunday of March / October (DST switch) | Correct duration, no false expiry |
| 9 | `manager.muenchen` opens a Berlin employee (US1-2) | HTTP 403 |
| 10 | Switch UI language DE → VI on a "not eligible" result (FR-015) | Message and fix shown in Vietnamese with German term |
| 11 | Add requirement version effective 1 Jan; check 31 Dec and 1 Jan (US4-1) | Old rule on 31 Dec, new rule on 1 Jan |
| 12 | Expiry list, default window (US3) | Items due within 30 days only |

Run scenarios 1–8 automatically:

```bash
cd backend && mvn -q -pl eligibility-engine test
```

Scenarios 9–12 are covered by `app` integration tests and a manual UI pass.

## Done when

All 12 scenarios pass, the ArchUnit rule "engine depends on no framework package" is green, and
the audit log shows an entry for every create/update/verify performed during the run.
