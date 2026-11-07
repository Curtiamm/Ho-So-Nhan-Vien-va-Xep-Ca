# German Working-Time Rules (ArbZG) for Automatic Shift-Scheduling Checks in Restaurants (Gastgewerbe), as of November 2026

Scope note: Law in force on 7 Nov 2026 = Arbeitszeitgesetz (ArbZG) of 6 June 1994, "zuletzt geändert durch Art. 52 G v. 23.10.2024 I Nr. 323" — [gesetze-im-internet.de](https://www.gesetze-im-internet.de/arbzg/BJNR117100994.html). No ArbZG amendment changing the scheduling rules below has been enacted in 2025–2026 (see the reform section). Everything labelled "DRAFT" is not law.

## 1. Daily maximum working time (§3) and how the weekly maximum is derived

### Takeaway
Law in force: max 8 h per Werktag, extendable to 10 h if the average stays at or under 8 h per Werktag over 6 calendar months or 24 weeks (§3). Werktage are Monday to Saturday, so the statutory weekly cap works out to 48 h on average (6 × 8) and 60 h in a single week (6 × 10). Breaks are not working time, and hours at all employers are added together (§2(1)).

### Cited Findings
- §3 sentence 1: "Die werktägliche Arbeitszeit der Arbeitnehmer darf acht Stunden nicht überschreiten." Sentence 2 allows up to 10 hours if an average of 8 hours per Werktag is not exceeded within 6 calendar months or 24 weeks. — [ArbZG, gesetze-im-internet.de](https://www.gesetze-im-internet.de/arbzg/BJNR117100994.html)
- §2(1): working time is "die Zeit vom Beginn bis zum Ende der Arbeit ohne die Ruhepausen". Working hours at several employers are added together. — [ArbZG §2](https://www.gesetze-im-internet.de/arbzg/__2.html)
- Hospitality guidance describes the basic rule as an "8-Stunden Arbeitstag" from Monday to Saturday, extendable to 10 h with averaging over six months. — [g-wie-gastro.de (modified 7 Dec 2025)](https://g-wie-gastro.de/recht-und-steuern/arbeitsrecht/arbeitszeiten-in-der-gastronomie/)
- Current law already allows a 48-hour week (§3 ArbZG) and up to 10 hours a day with averaging. — [accenon.de (modified 29 Oct 2026, vendor blog)](https://accenon.de/hr-prozesse-u-rechtliches/arbzg-reform-2026-tariflogik/)
- §11(2): §§3–8 apply to Sunday and holiday work, and Sunday/holiday working time may not push the employee past the maximum working times and compensation periods of §§3, 6(2), 7 and 21a(4). In other words, Sunday hours count toward the same averaging. — [ArbZG §11](https://www.gesetze-im-internet.de/arbzg/__11.html)
- Exceptions outside collective agreements. §14(1)/(2) allows temporary deviations from §§3–5, 6(2), 7, 9–11 in emergencies or exceptional cases that occur independently of the will of those affected and whose consequences cannot be removed another way. Spoiling foodstuffs is the statutory example. Even then, the average must stay at or under 48 h/week over 6 calendar months or 24 weeks (§14(3)). — [ArbZG §14](https://www.gesetze-im-internet.de/arbzg/__14.html)
- §15(1) Nr. 2: the supervisory authority may approve longer daily hours for Saison- und Kampagnebetriebe during the season, if hours over 8 per Werktag are offset by shorter hours at other times. §15(4) caps any such permit at a 48 h/week average over 6 calendar months or 24 weeks. — [ArbZG §15](https://www.gesetze-im-internet.de/arbzg/__15.html)
- Hours worked on a Sunday do not themselves have a hard 8-h cap. One gastro site claims Sunday work "must not exceed 8 hours" — [g-wie-gastro.de](https://g-wie-gastro.de/recht-und-steuern/arbeitsrecht/arbeitszeiten-in-der-gastronomie/). That claim conflicts with the statutory wording of §11(2), which applies §§3–8 "entsprechend", so the 10-h-with-averaging rule applies — [ArbZG §11](https://www.gesetze-im-internet.de/arbzg/__11.html). Treat the 8-h Sunday claim as unreliable.

### Inferences
- **Computable check D1 (hard daily cap):** for each employee and calendar day, sum the worked minutes of all shifts on that day minus breaks, across all branches and including declared hours at other employers. FAIL if the total is over 600 min (10 h). WARN if it is over 480 min, because the averaging debt then rises.
  - Recommended day boundary: assign each minute to the calendar day on which it is worked. A shift that crosses midnight is split at 00:00.
  - Ambiguity: commentators also use a "24 h from shift start" view (Arbeitstag ≠ Kalendertag). A conservative engine can check both.
- **Computable check D2 (averaging):** over a rolling (or fixed, as the company configures) window of 6 calendar months or 24 weeks, FAIL if total hours / number of Werktage in the window is over 8.0. Equivalent formulation: total hours over 24 weeks ≤ 24 × 48 = 1,152 h.
  - Inputs: hours per day; Werktage = Mon–Sat, including weekday public holidays according to the common reading. Sunday hours count toward the total via §11(2).
  - The window choice (6 months vs 24 weeks) is the employer's. Pick one per company and store it.
- **Computable check D3 (weekly sanity cap):** FAIL if a single calendar week has more than 60 h on Werktage plus Sunday hours. In practice, more than 60 h in one week is only possible via the §14/§15/§7 exceptions.
- Rule data model needs:
  - employee.otherEmployerHours (§2(1) aggregation; relevant for minijobbers with a second job)
  - employee.isMinor, so that the JArbSchG rules apply instead (§18(2))
  - employee.isLeitenderAngestellter, which exempts them under §18
  - company.averagingWindow ∈ {6 calendar months, 24 weeks}
  - flags for any §7/§12 collective-agreement deviations and §15 permits

### Gaps
- Whether days of paid leave or sickness may count as "compensation days" with 0 h in the §3 average. EU Directive 2003/88/EC Art. 16 reportedly makes leave and sick periods neutral, which would mean they cannot reduce the average. I could not fetch the Directive text to verify the exact wording, so treat this as unverified and contested.
- Calendar-day vs 24-hour-period definition of "werktäglich" for night shifts: no authoritative source was fetched.

## 2. Rest breaks (§4)

### Takeaway
More than 6 h up to 9 h of work requires at least 30 min of break. More than 9 h requires at least 45 min. Breaks must be fixed in advance and may be split into blocks of at least 15 min. Nobody may work more than 6 consecutive hours without a break. Breaks are not working time.

### Cited Findings
- §4 requires "im voraus feststehende Ruhepausen von mindestens 30 Minuten" for more than six to nine hours of work, and 45 minutes for more than nine hours. Breaks may be split into blocks of at least 15 minutes. Nobody may work more than six hours straight without a break. — [ArbZG](https://www.gesetze-im-internet.de/arbzg/BJNR117100994.html)
- The same thresholds are stated in hospitality guidance, which adds that the employer may set break timing under its right to direct work (Direktionsrecht). — [g-wie-gastro.de](https://g-wie-gastro.de/recht-und-steuern/arbeitsrecht/arbeitszeiten-in-der-gastronomie/)
- §7(1) Nr. 2: a collective agreement (or a works agreement based on one) may, in Schichtbetrieben and Verkehrsbetrieben only, split the total break into "Kurzpausen von angemessener Dauer". — [ArbZG §7](https://www.gesetze-im-internet.de/arbzg/__7.html)
- Violating §4 (break not granted, too short, or not on time) is an administrative offence under §22(1) Nr. 2, with a fine of up to €30,000 (§22(2)). — [ArbZG §22](https://www.gesetze-im-internet.de/arbzg/__22.html)
- The 2026 Referentenentwurf (DRAFT) reportedly leaves the §4 break obligation unchanged. — [accenon.de](https://accenon.de/hr-prozesse-u-rechtliches/arbzg-reform-2026-tariflogik/)

### Inferences
- **Computable check B1 (total break):** for each employee-day, compute net work time W (sum of work segments).
  - If W > 540 min (9 h): required break ≥ 45 min.
  - Else if W > 360 min (6 h): required break ≥ 30 min.
  - Count only break segments of at least 15 min toward the requirement.
  - Edge cases: exactly 6:00 h needs no break; exactly 9:00 h needs 30 min.
- **Computable check B2 (continuous work):** FAIL if any continuous work segment (between break blocks of at least 15 min) is longer than 360 min.
- **Computable check B3 (planned in advance):** the schedule must contain explicit break slots, or at least a break window, because "im voraus feststehend" means they must be fixed at the latest at the start of the shift. A shift template without planned breaks should raise a WARN.
- Note the 45-min threshold: a 9h15 shift needs 45 min of break, which pushes the span to 10h00. A planner should compute span = work + breaks.

### Gaps
- Whether a restaurant counts as a "Schichtbetrieb" for §7(1) Nr. 2 short breaks depends on the applicable collective agreement. No hospitality MTV clause on this was found.

## 3. Rest period between shifts (§5), hospitality reduction to 10 h, and split shifts

### Takeaway
At least 11 consecutive hours of rest after the end of the daily working time (§5(1)). In Gaststätten and other hospitality/lodging businesses, the rest can be cut by up to 1 h (to 10 h), if each cut is offset within one calendar month or four weeks by extending another rest period to at least 12 h (§5(2)). A collective agreement may cut the rest by up to 2 h (to 9 h) with compensation (§7(1) Nr. 3). Split shifts (geteilte Dienste / Teildienst) are not regulated explicitly. The 11 h run only after the last block of the day.

### Cited Findings
- §5(1): employees must have "eine ununterbrochene Ruhezeit von mindestens elf Stunden" after the end of their daily working time. — [ArbZG §5](https://www.gesetze-im-internet.de/arbzg/__5.html)
- §5(2): in hospitals and care facilities, "Gaststätten und anderen Einrichtungen zur Bewirtung und Beherbergung", transport, broadcasting, agriculture and animal husbandry, the rest period may be shortened by up to one hour. Each shortening must be offset "innerhalb eines Kalendermonats oder innerhalb von vier Wochen" by extending another rest period to at least twelve hours. — [ArbZG §5](https://www.gesetze-im-internet.de/arbzg/__5.html); same summary in [ArbZG full text](https://www.gesetze-im-internet.de/arbzg/BJNR117100994.html)
- §5(3) (on-call rest interruptions) applies only to hospitals and care facilities. §5(4) is repealed. — [ArbZG §5](https://www.gesetze-im-internet.de/arbzg/__5.html)
- §7(1) Nr. 3: a Tarifvertrag (or a works agreement based on one) may shorten the rest period by up to two hours, if the nature of the work requires it and the shortening is offset within a compensation period to be defined. — [ArbZG §7](https://www.gesetze-im-internet.de/arbzg/__7.html)
- §7(9): if daily working time is extended beyond 12 hours, a rest period of at least 11 hours must follow immediately. — [ArbZG §7](https://www.gesetze-im-internet.de/arbzg/__7.html)
- Violations are fined under §22(1) Nr. 3, up to €30,000. This covers not granting the 11 h, and also not compensating (or compensating late) a §5(2) shortening. — [ArbZG §22](https://www.gesetze-im-internet.de/arbzg/__22.html)
- Split shifts / geteilter Dienst:
  - Under §5 the rest period "beginnt diese Ruhezeit regelmäßig erst nach dem letzten Arbeitsblock des Tages". The gap inside a split day is not Ruhezeit.
  - The gap may count as Ruhepause or free time if the employee is free of duties, can choose where to spend it, and it was planned in advance. If the employee must stay available, it may be Bereitschaftsdienst (working time) instead.
  - Work blocks on the same day are added together for the daily limit. The ArbZG sets no maximum span and no maximum gap length.
  - Source: [Kanzlei Herfurtner (modified 3 Sep 2026)](https://kanzlei-herfurtner.de/geteilter-dienst/)
- Conflicting view on split shifts: one gastro guide states that working midday, breaking, then working again in the evening "is not compatible with the ArbZG" — [g-wie-gastro.de](https://g-wie-gastro.de/recht-und-steuern/arbeitsrecht/arbeitszeiten-in-der-gastronomie/). This contradicts the lawyer source above, which treats split shifts as permissible within §§3–5. Treat it as contested and unreliable. No ArbZG paragraph prohibits split shifts.
- Works councils have co-determination on start/end of daily working time and its distribution (§87 BetrVG), which covers split-shift patterns. — [Kanzlei Herfurtner](https://kanzlei-herfurtner.de/geteilter-dienst/)
- The 2026 Referentenentwurf (DRAFT): §5 rest periods reportedly unchanged — [accenon.de](https://accenon.de/hr-prozesse-u-rechtliches/arbzg-reform-2026-tariflogik/). Other sources report that the draft would allow the 11-h rest to be shortened, or to lapse, by Tarifvertrag only with health-protection rules beyond the current standard — [clockin.de (updated 27 Oct 2026)](https://www.clockin.de/blog/reform-des-arbeitszeitgesetzes---pflicht-zur-arbeitseiterfassung-in-2026); [buerger-geld.org (20 Aug 2026)](https://www.buerger-geld.org/news/arbeit/13-stunden-schicht-statt-8-stunden-tag-arbeitszeitreform-kommt-nur-fuer-tarifbetriebe-und-selbst-das-steckt-fest/).

### Inferences
- **Computable check R1 (minimum rest):** for each pair of consecutive "working days" of an employee, gap = start of the first work segment of the next day minus end of the last work segment of the previous day. Gaps between blocks of a split shift are excluded.
  - FAIL if gap < 600 min (10 h).
  - If 600 ≤ gap < 660 min, allowed only if company.sector = Gastgewerbe (§5(2)) and a compensation obligation is created.
  - FAIL if gap < 660 min and the employer is not in a §5(2) sector.
  - If a §7(1) Nr. 3 collective-agreement clause is configured, the floor becomes 540 min (9 h), with the compensation period taken from the agreement.
- **Computable check R2 (§5(2) compensation ledger):** each shortened rest of (660 − gap) min creates a debt. The debt must be cleared within 1 calendar month or 4 weeks (company-configured) by at least one other rest period of ≥ 720 min (12 h).
  - Statute requires "Verlängerung einer anderen Ruhezeit auf mindestens zwölf Stunden". Conservative implementation: one ≥ 12 h rest clears one shortening.
  - FAIL when the window expires uncleared. WARN when a shortening is scheduled and the window has no ≥ 12 h rest planned.
- **Computable check R3 (§7(9)):** if daily working time is over 12 h (possible only under §7 or §14 exceptions), the next gap must be at least 11 h, with no §5(2) reduction.
- **Split-shift handling:**
  - Model a working day as a list of segments.
  - Apply D1/B1/B2 across all segments of the day.
  - Treat inter-segment gaps of at least 15 min, where the employee is free, as breaks, not rest.
  - Apply R1 only from the last segment. Add a configurable max-span warning: tariff rules may limit span or number of interruptions, but none were verified.
- Interaction: the §11(4) Sunday/Ersatzruhetag rest should be combined with an 11 h rest, giving ≥ 35 h (see section 5).

### Gaps
- Not determined: whether a §5(2) one-hour cut and a §7(1) Nr. 3 tariff cut can be combined. Commentary not found.
- Not determined: whether one 12 h rest can compensate more than one shortening. Statutory text is ambiguous.
- No verified hospitality Manteltarifvertrag clause on split shifts (max number of interruptions / max span) was found. The NRW Tarifregister summary only lists 169 h/month as the standard monthly working time for Gaststätten- und Hotelgewerbe NRW (MTV valid from 1 May 2016) — [Tarifregister NRW](https://www.tarifregister.nrw.de/material/gaststaetten2.pdf).

## 4. Night work (§2(3)–(5), §6)

### Takeaway
Night time is 23:00–06:00. Night work is any work covering more than 2 h of night time. A night worker (Nachtarbeitnehmer) works nights in rotating shifts, or on at least 48 days per calendar year. Night workers:
- may work max 8 h per Werktag, extendable to 10 h only if the average is ≤ 8 h within 1 calendar month or 4 weeks (much shorter than the §3 window);
- have a right to medical examinations;
- may request transfer to a day job;
- must receive paid days off or an appropriate Nachtzuschlag, unless a collective agreement regulates this. Case law says 25%, or 30% for permanent night work.

### Cited Findings
- §2(3): Nachtzeit is 23:00 to 06:00 (22:00–05:00 in bakeries and confectioneries). §2(4): Nachtarbeit is "jede Arbeit, die mehr als zwei Stunden der Nachtzeit umfaßt". §2(5): Nachtarbeitnehmer are employees who normally do night work in Wechselschicht, or who do night work on "mindestens 48 Tagen im Kalenderjahr". — [ArbZG §2](https://www.gesetze-im-internet.de/arbzg/__2.html)
- §6(2): the daily working time of night workers "darf acht Stunden nicht überschreiten". It may be extended to 10 h only if the average stays at 8 h per Werktag within one calendar month or four weeks. For periods when §2(5) Nr. 2 workers do no night work, §3 sentence 2 (6 months / 24 weeks) applies. — [ArbZG §6](https://www.gesetze-im-internet.de/arbzg/__6.html)
- §6(3): night workers may have an occupational-medical examination before starting and then at intervals of not less than three years. After age 50 the interval is one year. The employer bears the costs unless it offers the exam free via a company doctor or inter-company service. — [ArbZG §6](https://www.gesetze-im-internet.de/arbzg/__6.html)
- §6(4): the employer must, on request, transfer a night worker to a suitable day job if:
  - (a) continued night work endangers their health according to a medical finding, or
  - (b) a child under 12 in the household cannot be cared for by another household member, or
  - (c) they care for a severely care-dependent relative.
  The transfer can be refused only for urgent operational reasons, after consulting the works council. — [ArbZG §6](https://www.gesetze-im-internet.de/arbzg/__6.html)
- §6(5): unless collective agreements provide compensation, the employer must give "an appropriate number of paid days off or an appropriate surcharge on gross pay" for night hours. — [ArbZG §6](https://www.gesetze-im-internet.de/arbzg/__6.html)
- BAG 9 Dec 2015, 10 AZR 423/14:
  - For employees without a collective agreement, 25% of the gross hourly wage is generally the appropriate night supplement.
  - For permanent night work (Dauernachtarbeit) it rises to 30%.
  - Lower amounts are possible where night time is only Bereitschaftsdienst.
  - Source: [LTO](https://www.lto.de/recht/nachrichten/n/bag-urteil-10-azr-423-14-dauerhafte-nachtarbeit-zuschlag-30-prozent)
- §6(6): night workers must have equal access to training and advancement. — [ArbZG §6](https://www.gesetze-im-internet.de/arbzg/__6.html)
- §7(1) Nr. 5: a collective agreement may set the start of the 7-hour night period between 22:00 and 24:00. — [ArbZG §7](https://www.gesetze-im-internet.de/arbzg/__7.html)
- Exceeding §6(2) limits is fined under §22(1) Nr. 1 (up to €30,000). Note: §6(3) examinations are not listed in §22(1). — [ArbZG §22](https://www.gesetze-im-internet.de/arbzg/__22.html)

### Inferences
- **Computable check N1 (classify the shift):** nightMinutes = overlap of shift work segments with [23:00, 06:00), or the tariff-configured window. isNightWork = nightMinutes > 120.
- **Computable check N2 (classify the worker):** isNightWorker = (employee is in a rotating-shift pattern that includes night work) OR (count of days with isNightWork in the calendar year ≥ 48).
  - Track the count prospectively: when planned plus worked night-work days reach 48, flag the employee as a Nachtarbeitnehmer for that year.
  - The flag then triggers N3 and the §6(3) exam entitlement.
- **Computable check N3 (night-worker daily cap):** for Nachtarbeitnehmer, FAIL if a day is over 10 h. FAIL if the average over a 1-calendar-month or 4-week window is over 8 h per Werktag. This applies to periods in which they do night work.
- **Payroll hook N4:** compute night hours for the supplement or for free-day credit. The default when no collective agreement applies is 25% (30% for permanent night workers), per BAG. The rate should be configurable, because collective agreements override.
- Restaurant relevance: closing shifts ending after 01:00 (e.g. 18:00–01:30 covers 2.5 h of night time) are night work. Bars and late kitchens can easily reach 48 night-work days/year.

### Gaps
- How "Wechselschicht" is assessed for typical restaurant rotas (early/late without regular night shifts): no authoritative source found.
- Concrete paid-days-off ratio as an alternative to the supplement: BAG case law exists, but no source was fetched for the conversion ratio.

## 5. Sunday and public-holiday work (§§9–12)

### Takeaway
Work on Sundays and public holidays (00:00–24:00) is generally prohibited (§9(1)). §10(1) Nr. 4 exempts work "in Gaststätten und anderen Einrichtungen zur Bewirtung und Beherbergung", where the work cannot be done on Werktage. Hospitality employees still need:
- at least 15 work-free Sundays per year (§11(1)), reducible by collective agreement to at least 10 for Gaststätten (§12 Nr. 1);
- a substitute rest day (Ersatzruhetag) within a 2-week window including the Sunday worked, or within 8 weeks for a weekday holiday (§11(3));
- the Sunday/Ersatzruhetag combined directly with an 11 h rest where possible (§11(4)).

### Cited Findings
- §9(1): "Arbeitnehmer dürfen an Sonn- und gesetzlichen Feiertagen von 0 bis 24 Uhr nicht beschäftigt werden." §9(2)/(3) contain shift-operation and driver exceptions that shift the start of the rest. — [ArbZG](https://www.gesetze-im-internet.de/arbzg/BJNR117100994.html)
- §10(1): Sunday/holiday work is allowed "Sofern die Arbeiten nicht an Werktagen vorgenommen werden können". Nr. 4 covers "in Gaststätten und anderen Einrichtungen zur Bewirtung und Beherbergung sowie im Haushalt". — [ArbZG](https://www.gesetze-im-internet.de/arbzg/BJNR117100994.html)
- §11(1): "Mindestens 15 Sonntage im Jahr müssen beschäftigungsfrei bleiben." — [ArbZG §11](https://www.gesetze-im-internet.de/arbzg/__11.html)
- §11(2): §§3–8 apply to Sunday/holiday work. Sunday/holiday hours may not exceed the maxima and compensation periods of §§3, 6(2), 7, 21a(4). — [ArbZG §11](https://www.gesetze-im-internet.de/arbzg/__11.html)
- §11(3): a substitute rest day for Sunday work must be granted "within a two-week period that includes the day of employment". For work on a public holiday falling on a Werktag, it must be granted within eight weeks. — [ArbZG §11](https://www.gesetze-im-internet.de/arbzg/__11.html)
- §11(4): Sunday/holiday rest (§9) or the substitute rest day should be granted directly in connection with a §5 rest period, unless "technische oder arbeitsorganisatorische Gründe" stand against it. — [ArbZG §11](https://www.gesetze-im-internet.de/arbzg/__11.html)
- §12 lets a Tarifvertrag (or a works agreement based on one) deviate as follows. §7(3)–(6) apply. — [ArbZG §12](https://www.gesetze-im-internet.de/arbzg/__12.html)
  - Nr. 1: reduce free Sundays for §10(1) Nr. 2, 3, 4 and 10 businesses (which include Gaststätten) "auf mindestens zehn Sonntage". Broadcasting/theatres/orchestras/exhibitions: 8. Cinemas/animal husbandry: 6.
  - Nr. 2: waive Ersatzruhetage for weekday holidays, or grant free time within a defined compensation period instead.
  - Nr. 4: 12 h Sunday shifts in fully continuous shift operations.
- Fines: §22(1) Nr. 5 covers employing contrary to §9(1). §22(1) Nr. 6 covers employing on all Sundays contrary to §11(1), and not granting (or granting late) the Ersatzruhetag. Up to €30,000 each. — [ArbZG §22](https://www.gesetze-im-internet.de/arbzg/__22.html)
- Hospitality guidance: a Sunday/holiday pay supplement is owed only if the contract, a collective agreement or betriebliche Übung provides for it. The ArbZG itself does not require Sunday pay supplements. — [g-wie-gastro.de](https://g-wie-gastro.de/recht-und-steuern/arbeitsrecht/arbeitszeiten-in-der-gastronomie/)
- Side note (bakeries, not restaurants): the federal government announced extending §10(1) to the Bäckereihandwerk — [BT-Drs. 21/6246 (1 June 2026)](https://dserver.bundestag.de/btd/21/062/2106246.pdf). The coalition's July 2026 package included longer Sunday hours for bakeries/confectioneries/libraries — [t-online (3 Jul 2026)](https://www.t-online.de/nachrichten/deutschland/innenpolitik/id_101324870/arbeitszeitgesetz-und-acht-stunden-tag-merz-und-bas-weiter-uneinig.html). This does not change the Gaststätten rules.

### Inferences
- **Computable check S1 (free Sundays):** a Sunday is "beschäftigungsfrei" only if the employee has zero work minutes between 00:00 and 24:00 that Sunday. A Saturday shift ending at 00:30 Sunday therefore consumes that Sunday.
  - Per employee and year: freeSundays = count of Sundays with 0 work minutes. FAIL if freeSundays < 15, or < 10 if a §12 collective-agreement deviation is configured.
  - Because this is a year-end condition, implement it prospectively. maxAssignableSundays = totalSundays(year) − minFreeSundays (52/53 − 15 = 37/38). WARN when remaining free Sundays approach the minimum.
  - "Im Jahr" is most commonly read as the calendar year (not verified).
- **Computable check S2 (Ersatzruhetag for Sunday):**
  - For each Sunday with work > 0, require a substitute rest day: a full work-free Werktag (0–24 h) within the 2-week period that includes that Sunday.
  - Common reading: the 2-week window can lie before or after the Sunday, since it is "den Beschäftigungstag einschließend". Conservative implementation: the Sunday ± 13 days (the span must be 14 days containing the Sunday), or after-only if the company prefers.
  - Each Sunday worked consumes a distinct substitute day.
- **Computable check S3 (Ersatzruhetag for weekday holiday):** for each statutory holiday on Mon–Sat that is worked, require a distinct work-free Werktag within 8 weeks, unless a §12 Nr. 2 collective-agreement waiver is configured.
- **Computable check S4 (§11(4) combination, soft rule):** WARN if the free Sunday / substitute day is not directly adjacent to an 11 h rest, i.e. the employee does not get ≥ 35 consecutive free hours (24 h + 11 h). "Soll" provision: a warning, not a hard violation.
- **Multi-branch requirement:** statutory public holidays differ by Bundesland (and partly by municipality). Each branch needs its own holiday calendar for §9/§11(3) checks. This is general knowledge; verify the holiday lists per state.
- §10 "cannot be done on Werktage" is satisfied for guest service in restaurants. Pure back-office or admin work on Sundays is not automatically covered. A flag per role/task type could be useful.

### Gaps
- Not verified: whether the Ersatzruhetag can be a day that would have been free anyway (e.g. the regular day off in a 5-day week). Commonly said yes in BAG case law, but no source was fetched. The rule designer should decide conservatively, or obtain BAG case references.
- Not verified: whether the major regional hospitality MTVs (DEHOGA/NGG) actually use §12 Nr. 1 to reduce free Sundays to 10. Only the statutory possibility is confirmed.
- No source fetched for the calendar-year vs any-12-months interpretation of "im Jahr".

## 6. Deviations by collective agreement (§7, §12), DEHOGA context, and absolute limits

### Takeaway
A Tarifvertrag (or a works agreement based on one) can loosen several rules:
- longer days (only with regular on-call/standby time), and other compensation periods (§7(1) Nr. 1);
- short breaks in shift operations (§7(1) Nr. 2);
- rest cut by up to 2 h with compensation (§7(1) Nr. 3);
- night-period start between 22:00 and 24:00 (§7(1) Nr. 5);
- fewer free Sundays, down to 10 for Gaststätten (§12 Nr. 1), and no Ersatzruhetag for weekday holidays (§12 Nr. 2).

Non-tariff-bound employers within the agreement's scope can adopt these via works agreement or written individual agreement (§7(3)). Limits that remain in all cases:
- 48 h/week average over 12 calendar months (§7(8));
- 11 h rest after any day over 12 h (§7(9));
- written employee consent for opt-outs (§7(7));
- the 48 h average in §14/§15 cases.

Only about 30% of hospitality employees are in tariff-bound businesses.

### Cited Findings
- §7(1), via Tarifvertrag or a works agreement based on one. — [ArbZG §7](https://www.gesetze-im-internet.de/arbzg/__7.html)
  - Nr. 1(a): extend working time beyond 10 h per Werktag if regular and significant Arbeitsbereitschaft or Bereitschaftsdienst falls within it.
  - Nr. 1(b): set "einen anderen Ausgleichszeitraum".
  - Nr. 2: split breaks into short breaks in shift/transport operations.
  - Nr. 3: shorten rest by up to 2 h if the nature of the work requires it and it is compensated.
  - Nr. 4: corresponding deviations from §6(2) for night workers.
  - Nr. 5: set night-period start between 22:00 and 24:00.
- §7(2a): extending working time over 8 h without compensation is allowed only with regular and significant standby time plus special health-protection rules. — [ArbZG §7](https://www.gesetze-im-internet.de/arbzg/__7.html)
- §7(3): in the scope of a collective agreement, non-tariff-bound employers can adopt the deviating rules by works agreement or, where there is no works council, by written agreement with the employee. — [ArbZG §7](https://www.gesetze-im-internet.de/arbzg/__7.html)
- §7(7): such extensions require the employee's written consent, revocable with 6 months' notice. There must be no disadvantage for refusing. — [ArbZG §7](https://www.gesetze-im-internet.de/arbzg/__7.html)
- §7(8): where these deviations are used, working time "darf ... 48 Stunden wöchentlich im Durchschnitt von zwölf Kalendermonaten nicht überschreiten". For permits under §7(5), the period is 6 calendar months or 24 weeks. — [ArbZG §7](https://www.gesetze-im-internet.de/arbzg/__7.html)
- §7(9): days over 12 h must be followed immediately by at least 11 h of rest. — [ArbZG §7](https://www.gesetze-im-internet.de/arbzg/__7.html)
- §12: Tarifvertrag may reduce free Sundays for Gaststätten (§10(1) Nr. 4) to a minimum of 10, waive Ersatzruhetage for weekday holidays, etc. §7(3)–(6) apply. — [ArbZG §12](https://www.gesetze-im-internet.de/arbzg/__12.html)
- §16(1): employers must make the ArbZG, applicable ordinances and applicable collective/works agreements available to employees, by IT systems or posting. Violation is fined up to €5,000. — [ArbZG §16](https://www.gesetze-im-internet.de/arbzg/__16.html); [ArbZG §22](https://www.gesetze-im-internet.de/arbzg/__22.html)
- Tariff coverage: DZG says only about 30% of employees in the Gastwelt work in tariff-bound businesses, so about 70% would not benefit from tariff-only flexibility. — [HOGAPAGE (19 Jun 2026)](https://www.hogapage.de/nachrichten/politik/branchenpolitik/arbeitszeit-reform-gastgewerbe-fordert-nachbesserungen/)
- Example regional agreement: DEHOGA Gastgewerbe NRW and NGG NRW. — [Tarifregister NRW](https://www.tarifregister.nrw.de/material/gaststaetten2.pdf)
  - Manteltarifvertrag valid since 1 May 2016.
  - Entgelttarifvertrag valid from 1 Jun 2026 (terminable to 31 May 2028).
  - "Monatliche Regelarbeitszeit: 169 Stunden".
- Leitende Angestellte are excluded from the ArbZG (§18), and under-18s fall under the JArbSchG. — [ArbZG](https://www.gesetze-im-internet.de/arbzg/BJNR117100994.html)

### Inferences
- **Rule-engine design:** implement every threshold as a parameter with a statutory default, plus an optional "legal basis" override record (TV name, clause, validity dates, scope: branch/employee group). Parameters:
  - maxDailyHours = 10
  - averagingWindow = 6 months / 24 weeks
  - minRest = 11 h, hospitality reduction = 1 h, compensation window = 1 month / 4 weeks, compensation rest = 12 h
  - nightWindowStart = 23:00
  - minFreeSundays = 15
  - ersatzruhetagWindowSunday = 2 weeks, ersatzruhetagWindowHoliday = 8 weeks
- Hard floors even with a collective agreement:
  - 48 h average over ≤ 12 months (§7(8));
  - 11 h rest after > 12 h days (§7(9));
  - minFreeSundays ≥ 10 for Gaststätten;
  - minRest ≥ 9 h (11 − 2 under §7(1) Nr. 3);
  - written consent for §7(2a)/(7) opt-outs.
- For a restaurant chain, the §7(1) Nr. 1(a) extension beyond 10 h is rarely applicable, because it requires regular and significant on-call/standby time. Treat 10 h as the practical hard cap.

### Gaps
- Actual working-time clauses of the major hospitality MTVs (e.g. DEHOGA Bayern/NGG, NRW, Baden-Württemberg) were not obtained. These include weekly hours, split-shift limits, free days per week, use of §7/§12, and Sunday/night supplements.
- Allgemeinverbindlichkeit status per Land: one IHK sheet (April 2026, region unnamed) states "der Manteltarifvertrag ist allgemeinverbindlich" — [IHK Merkblatt](https://www.ihk.de/blueprint/servlet/resource/blob/1676810/36c746af3fd277b8a6b35c33b0f5547a/merkblatt-tarifliche-regelungen-im-hotel-und-gaststaettengewerb-data.pdf). Region and parties were not identifiable, so verify per branch Land.

## 7. Record-keeping obligations (§16(2) ArbZG, BAG 1 ABR 22/21, EuGH C-55/18, MiLoG §17)

### Takeaway
Law in force:
- §16(2) ArbZG requires recording hours beyond 8 h per Werktag, plus a list of employees who consented to opt-outs, kept ≥ 2 years.
- Since BAG 13 Sept 2022 (1 ABR 22/21), employers must record the start, end and duration of all daily working time, under §3(2) Nr. 1 ArbSchG read in line with EuGH C-55/18. Paper is still allowed today.
- Gaststätten are additionally covered by MiLoG §17 (via §2a SchwarzArbG): start, end and duration for every employee, recorded by the end of the 7th calendar day after the work day, kept ≥ 2 years.

A statutory electronic, same-day recording duty exists only in the 2026 DRAFT, which is not yet law.

### Cited Findings
- §16(2) ArbZG: the employer must record working time beyond "werktägliche Arbeitszeit des § 3 Satz 1", keep a list of employees who consented under §7(7), and keep the records "mindestens zwei Jahre". — [ArbZG §16](https://www.gesetze-im-internet.de/arbzg/__16.html)
- BAG 13 Sept 2022, 1 ABR 22/21. — [BAG](https://www.bundesarbeitsgericht.de/entscheidung/1-abr-22-21/)
  - Employers must "Beginn und Ende der täglichen Arbeitszeit der Arbeitnehmer ... erfassen" (including overtime), based on §3(2) Nr. 1 ArbSchG read in line with EU law (EuGH C-55/18, Directive 2003/88/EC).
  - §16(2) ArbZG itself covers only hours beyond the daily norm.
  - Recording need not always be electronic.
  - The works council has no initiative right to force an electronic system, but co-determines the design (§87(1) Nr. 7 BetrVG).
- EuGH requires an objective, reliable and accessible system for measuring daily working time. As of June 2026, no fixed format is prescribed and handwritten records are possible. — [HOGAPAGE (15 Jun 2026)](https://www.hogapage.de/nachrichten/arbeitswelt/ratgeber/arbeitszeiterfassung-2026-welche-regeln-gelten-im-gastgewerbe/)
- MiLoG §17(1): employers of geringfügig Beschäftigte (§8(1) SGB IV) or of workers in the sectors listed in §2a SchwarzArbG must record start, end and duration of daily working time. The deadline is the end of the seventh calendar day after the day of work, and records are kept at least two years. §17(2) requires availability in Germany, in German. No electronic form is required. — [MiLoG §17](https://www.gesetze-im-internet.de/milog/__17.html)
- §2a(1) SchwarzArbG lists "Gaststätten- und Beherbergungsgewerbe" (Nr. 2). Workers there must carry ID and show it to customs on request. — [SchwarzArbG §2a](https://www.gesetze-im-internet.de/schwarzarbg_2004/__2a.html)
- Fines: §22(1) Nr. 9 ArbZG covers §16(2) records not made, incorrect, or not kept, with fines up to €30,000. — [ArbZG §22](https://www.gesetze-im-internet.de/arbzg/__22.html)
- The 2023 Heil draft on electronic recording never became law. — [LTO (6 May 2026)](https://www.lto.de/recht/nachrichten/n/bas-kuendigt-gesetzentwurf-arbeitszeitgesetz-an-juni-2026); [buerger-geld.org](https://www.buerger-geld.org/news/arbeit/13-stunden-schicht-statt-8-stunden-tag-arbeitszeitreform-kommt-nur-fuer-tarifbetriebe-und-selbst-das-steckt-fest/)
- DRAFT (BMAS Referentenentwurf, June 2026; NOT LAW), new §16 ArbZG, as summarized by a law firm — [unsere-kanzlei.de (updated 13 Sep 2026)](https://www.unsere-kanzlei.de/referentenentwurf-arbeitszeitgesetz/):
  - Start, end and duration of daily working time, recorded electronically on the same day; no specific technology is prescribed.
  - Delegation to employees or third parties is allowed, but the employer stays responsible.
  - Retention for the duration of employment, max 2 years, in German. Employee right to information and a copy.
  - Permanent exemption from the electronic form for employers with ≤ 10 employees and for private households.
  - Transition periods after entry into force: 1 year (≥ 250 employees), 2 years (< 250), 5 years (< 50).
  - A Tarifvertrag (or works agreement based on one) may deviate on form and timing, with recording by the end of the 7th calendar day at the latest.
  - Vertrauensarbeitszeit stays allowed, but the employer must ensure it learns of violations (e.g. automatic alerts).
  - Fines up to €30,000 for recording violations.
  - Leitende Angestellte are exempt from the recording duty (§18).
  - Entry into force: first day of the quarter following promulgation.
  - Same picture (≤ 10 exemption; ~1/2/5-year transitions) in [accenon.de](https://accenon.de/hr-prozesse-u-rechtliches/arbzg-reform-2026-tariflogik/) and [clockin.de](https://www.clockin.de/blog/reform-des-arbeitszeitgesetzes---pflicht-zur-arbeitseiterfassung-in-2026).

### Inferences
- **Implementation requirement (law in force):** for every employee and work day, store actual start, end and break segments (not only the plan), and derive the duration. Keep records ≥ 2 years. The MiLoG deadline in the restaurant sector is the 7th calendar day.
  - Also maintain the §16(2) list of employees who gave §7(7) written consent.
  - Provide an employee view of their own records. EuGH "accessible" requirement; the draft adds an explicit information right.
- **Compliance checks must run on actuals as well as on the plan:** (a) a pre-assignment check on the planned roster, (b) a post-hoc check on clocked times. Real overruns (e.g. late closing) cause most violations.
- **Future-proofing (DRAFT):** design for same-day electronic capture now. A multi-branch chain will likely exceed 10 employees, so it would not be exempt. If it has 50–249 employees it would get 2 years, and with ≥ 250 only 1 year after entry into force (if the draft passes unchanged).

### Gaps
- MiLoDokV exemptions (salary thresholds, close family members) under MiLoG §17(3)/(4) were not fetched. Verify current thresholds before implementing exceptions.
- Unclear: whether the final bill will keep the same-day deadline and the size thresholds. The draft is unpublished officially and only secondary summaries were available.

## 8. CURRENT REFORM STATUS: daily maximum to weekly maximum (status as of early Nov 2026)

### Takeaway
As of the latest sources (19–29 Oct 2026), there is no adopted reform. There is no cabinet decision, no bill in the Bundestag, and no entry-into-force date. The daily 8 h / 10 h maximum of §3 and all other rules above remain the law in force.

Timeline:
- **Coalition agreement:** foresees a weekly instead of daily maximum, in line with Directive 2003/88/EC.
- **Jan 2026:** the cabinet endorsed a National Tourism Strategy calling for this. That was a strategy, not a bill.
- **Mid-June 2026:** BMAS (Minister Bärbel Bas) produced a Referentenentwurf. It allows the weekly maximum only via Tarifvertrag (Tarifvorbehalt), with extra health protection, plus mandatory electronic same-day time recording.
- **Early July 2026:** the coalition committee left it out of its package.
- **12 Oct 2026:** Bas resigned. Alexander Schweitzer (SPD) succeeded her. Shortly before, the draft had gone to the Chancellery for early coordination.
- **19–29 Oct 2026:** the Union still rejects the Tarifvorbehalt. No agreement.

Earliest realistic entry into force per commentators: 2027.

### Cited Findings
- **Coalition plan / government statement:**
  - The coalition agreement provides for a weekly instead of daily maximum, in line with the EU Working Time Directive; details to be discussed with the social partners.
  - Social-partner dialogue took place in H2 2025 with far-apart positions.
  - BMAS planned a Referentenentwurf for H1 2026.
  - Source: [BT-Drs. 21/6246, Antwort der Bundesregierung, 1 Jun 2026](https://dserver.bundestag.de/btd/21/062/2106246.pdf)
- **Tourism strategy (Jan 2026):**
  - The cabinet endorsed a National Tourism Strategy (BMWE) that includes replacing the 8-h daily maximum with a weekly maximum. This is not a bill.
  - BMAS was to draft a proposal, to be decided "noch in diesem Jahr".
  - Source: [pta-in-love.de (30 Jan 2026)](https://www.pta-in-love.de/?p=135256)
- **6 May 2026:** Minister Bas told the Bundestag "Der Entwurf wird im Juni kommen", and also wanted electronic time recording rules. — [LTO](https://www.lto.de/recht/nachrichten/n/bas-kuendigt-gesetzentwurf-arbeitszeitgesetz-an-juni-2026)
- **Referentenentwurf presented 16/18 June 2026.** As of 15 Sep 2026: inter-ministry and stakeholder consultation ongoing; no cabinet decision, no Bundestag or Bundesrat stage; entry into force earliest late 2026, more realistically 2027. — [der-arbeitszeitrechner.de (15 Sep 2026)](https://der-arbeitszeitrechner.de/arbeitszeitgesetz-2026-reform/)
- **Leaked draft (19 Jun 2026):** a weekly limit instead of a daily one only if agreed in a Tarifvertrag or a (tariff-based) Betriebsvereinbarung with health-protection rules. The average weekly limit may not exceed 48 h. The eight-hour day stays largely unchanged otherwise. — [HOGAPAGE](https://www.hogapage.de/nachrichten/politik/branchenpolitik/arbeitszeit-reform-gastgewerbe-fordert-nachbesserungen/)
- **Draft details** — [unsere-kanzlei.de (13 Sep 2026)](https://www.unsere-kanzlei.de/referentenentwurf-arbeitszeitgesetz/):
  - Only Tarifvertragsparteien can agree the weekly model, or delegate it to Betriebsparteien.
  - Non-tariff-bound employers without such a basis stay on the daily maximum.
  - Upper limit 48 h on average "gerechnet über zwölf Kalendermonate".
  - Required health-protection rules, e.g. limiting consecutive long days, adequate rest after long periods.
  - Compensation periods for overtime would fall from 6 months / 24 weeks to 4 months / 16 weeks.
  - The 11 h rest stays, with the sector-specific 1 h reduction.
  - Conflict on the reference period: accenon reports the 48 h averaged "over up to six months" — [accenon.de](https://accenon.de/hr-prozesse-u-rechtliches/arbzg-reform-2026-tariflogik/). echo24 says the annual average must stay within 48 weekly hours — [echo24 (13 Oct 2026)](https://www.echo24.de/welt/stunden-tag-bas-ruecktritt-koennte-blockade-kippen-zr-94539377.html). The 4-months/16-weeks reduction is reported only by unsere-kanzlei (single source).
- **Daily ceiling under the weekly model:**
  - No statutory daily ceiling in the draft is reported. Up to ~12 h individual days are "discussed" — [accenon.de](https://accenon.de/hr-prozesse-u-rechtliches/arbzg-reform-2026-tariflogik/).
  - Critics note that with only the 11 h rest kept, 13-h days become possible — [LTO](https://www.lto.de/recht/nachrichten/n/bas-kuendigt-gesetzentwurf-arbeitszeitgesetz-an-juni-2026).
  - Union/employer plans would allow days of up to 13 h minus a 45-min break, with the 48-h weekly maximum staying — [Tagesspiegel (19/20 Oct 2026)](https://www.tagesspiegel.de/wirtschaft/zwolf-stunden-arbeit-am-tag-union-und-verbande-beharren-auf-anderung-des-arbeitszeitgesetzes-16160486.html).
- **Without a Tarifvertrag, §3 stays unchanged** (8 h rule, 10 h with 6-month compensation). The coalition committee of 1–2 July 2026 agreed 34 measures without the working-time reform. — [buerger-geld.org (20 Aug 2026)](https://www.buerger-geld.org/news/arbeit/13-stunden-schicht-statt-8-stunden-tag-arbeitszeitreform-kommt-nur-fuer-tarifbetriebe-und-selbst-das-steckt-fest/)
- **3 Jul 2026:**
  - Positions described as irreconcilable.
  - Bas wants the flexibility only for tariff-bound companies and bundled with time recording. CDU/CSU want it for all workers.
  - Merz said the Arbeitszeitgesetz should follow "im Herbst".
  - Source: [t-online](https://www.t-online.de/nachrichten/deutschland/innenpolitik/id_101324870/arbeitszeitgesetz-und-acht-stunden-tag-merz-und-bas-weiter-uneinig.html)
- **12 Oct 2026:** Bas resigns as Labour Minister and SPD co-chair, and Alexander Schweitzer succeeds her. Bas's ministry had recently sent a draft to the Chancellery for "Frühkoordinierung". — [WirtschaftsWoche (12 Oct 2026)](https://www.wiwo.de/politik/deutschland/alexander-schweitzer-was-der-neue-arbeitsminister-fuer-die-union-bedeutet/100261489.html); [echo24 (13 Oct 2026)](https://www.echo24.de/welt/stunden-tag-bas-ruecktritt-koennte-blockade-kippen-zr-94539377.html)
  - accenon (vendor blog) gives resignation on 12 Oct and swearing-in of Schweitzer on 14 Oct 2026 — [accenon.de](https://accenon.de/hr-prozesse-u-rechtliches/arbzg-reform-2026-tariflogik/). The 14 Oct date is single-source.
- **19/20 Oct 2026:**
  - Schweitzer prioritizes pension reform and is not expected to take on the working-time law as well.
  - CDU spokesman Biadacz calls the Tarifvorbehalt "Humbug" ("Jetzt muss das Ding kommen").
  - DEHOGA (Jana Schimke) calls the Tarifvorbehalt a "taktisches Manöver". Verdi rejects even the tariff-limited version.
  - No cabinet decision or timeline mentioned.
  - Source: [Tagesspiegel](https://www.tagesspiegel.de/wirtschaft/zwolf-stunden-arbeit-am-tag-union-und-verbande-beharren-auf-anderung-des-arbeitszeitgesetzes-16160486.html)
- **As of 29 Oct 2026:** no Kabinettsbeschluss, no Bundestag procedure, no timetable. Union and SPD still negotiating without agreement; entry into force "frühestens 2027". — [accenon.de](https://accenon.de/hr-prozesse-u-rechtliches/arbzg-reform-2026-tariflogik/)
- **DEHOGA reaction (June 2026):**
  - DEHOGA Bundesverband: "Enttäuschung auf der ganzen Linie".
  - DEHOGA Bayern wants the draft withdrawn and the weekly max to apply to all businesses by law.
  - About 70% of hospitality businesses/employees would not benefit due to the Tarifvorbehalt.
  - Source: [HOGAPAGE](https://www.hogapage.de/nachrichten/politik/branchenpolitik/arbeitszeit-reform-gastgewerbe-fordert-nachbesserungen/)
- **What stays under the draft** per [accenon.de](https://accenon.de/hr-prozesse-u-rechtliches/arbzg-reform-2026-tariflogik/):
  - §5 rest (11 h), §4 breaks, the 48 h weekly cap, §7 as the tariff opening clause.
  - (Contrast: clockin reports a possible tariff-based removal of the 11-h rest with extra health protection — [clockin.de](https://www.clockin.de/blog/reform-des-arbeitszeitgesetzes---pflicht-zur-arbeitseiterfassung-in-2026).)

### Inferences
- For a system shipped in 2026/early 2027, implement the in-force §3 daily model as the default. Make "weekly maximum mode" a feature flag that can be enabled only with a stored legal basis (Tarifvertrag/BV reference). Even if the draft passes unchanged, non-tariff-bound restaurants (≈70% of the sector) would stay on the daily model.
- Constants that survive every reform scenario seen:
  - 48 h average weekly cap (EU directive; reference period 6 or 12 months depending on source/draft);
  - 11 h daily rest, with the hospitality 1 h reduction plus 12 h compensation;
  - §4 breaks;
  - Sunday rules (§§9–12, untouched by the draft);
  - night-work rules (§6).
- The electronic time-recording duty (same day) is the part most likely to affect a scheduling product. It is tied politically to the weekly-maximum reform in the SPD draft.

### Gaps
- No official BMAS publication of the Referentenentwurf text was retrieved. All draft details are from secondary summaries (law-firm/vendor blogs, press) and partly conflict: 48 h averaged over 6 vs 12 months; 11 h rest unchanged vs tariff-removable; compensation periods 4 months/16 weeks.
- Nothing found dated after 29 Oct 2026. Any cabinet decision in the first week of November 2026 would not be captured. Re-check DIP (dip.bundestag.de) and bmas.de before finalizing.

## 9. Penalties (§22, §23 ArbZG)

### Takeaway
Most scheduling violations are administrative offences with fines up to €30,000 each. This covers hours over the cap, breaks, rest periods, Sunday work, free Sundays/Ersatzruhetag, and records. Failure to display the law is fined up to €5,000. Intentional violations that endanger health, or persistent repetition, are crimes: up to 1 year imprisonment or a fine; negligent endangerment up to 6 months or 180 daily rates.

### Cited Findings
- §22(1) lists administrative offences by an employer acting intentionally or negligently. — [ArbZG §22](https://www.gesetze-im-internet.de/arbzg/__22.html)
  - Nr. 1: exceeding §§3, 6(2), 21a(4) (also with §11(2)).
  - Nr. 2: §4 breaks.
  - Nr. 3: §5(1) rest / §5(2) compensation.
  - Nr. 5: §9(1) Sunday/holiday employment.
  - Nr. 6: employing on all Sundays contrary to §11(1), or not granting the Ersatzruhetag under §11(3).
  - Nr. 8: §16(1) display.
  - Nr. 9: §16(2) records.
  - Nr. 10: §17(4) information to the authority.
- §22(2): fines up to €30,000 for Nr. 1–7, 9, 10; up to €5,000 for Nr. 8. — [ArbZG §22](https://www.gesetze-im-internet.de/arbzg/__22.html)
- §23: intentional §22(1) Nr. 1–3, 5, 6 violations that endanger an employee's health or work capacity, or persistent repetition, are punishable by up to one year imprisonment or a fine. Negligently causing the endangerment is punishable by up to six months or a fine of up to 180 daily rates. — [ArbZG](https://www.gesetze-im-internet.de/arbzg/BJNR117100994.html)
- DRAFT: fines up to €30,000 for violating the new recording, retention and information duties. — [unsere-kanzlei.de](https://www.unsere-kanzlei.de/referentenentwurf-arbeitszeitgesetz/)

### Inferences
- Fines are per violation (per affected employee/instance in enforcement practice). Systematic roster errors across several branches can therefore multiply exposure. "Beharrlich wiederholt" violations become criminal (§23(1) Nr. 2). This argues for blocking (hard-stop) checks on §3/§4/§5/§9/§11 and an audit log of manager overrides.
- §22(1) Nr. 6 wording ("an allen Sonntagen" for §11(1)) suggests the fine for §11(1) is literally framed around employing on all Sundays. Shortfalls below 15 free Sundays (but not zero) may be enforced differently. This is a legal nuance to flag, not to rely on; keep the 15-Sunday check as a hard rule anyway.

### Gaps
- Enforcement practice (typical fine amounts per violation by Länder authorities / customs FKS in hospitality) was not researched.
- Not researched: the exact §23 wording and its interplay with §22(1) Nr. 6 regarding the "all Sundays" phrasing. Verify against the official text.
