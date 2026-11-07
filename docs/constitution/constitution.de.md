# Verfassung des Projekts Personalakten & Schichtplanung (DT05)

> Deutsche Übersetzung von `.specify/memory/constitution.md`. Maßgeblich ist die englische Fassung;
> bei Abweichungen gilt der englische Text.

Projekt: Personalakten mit befristeten Nachweisen und Pflichtschulungen, bedarfsgerechte
Schichtplanung je Filiale, automatische Prüfung des deutschen Arbeitszeitrechts, Dienstplanansicht
für Mitarbeitende und Schichttauschanfragen, für eine Restaurantkette (oder ein Restaurant) in
Deutschland.

Ziel: Jeder veröffentlichte Dienstplan ist rechtskonform, hält die Vereinbarungen zwischen
Restaurant und allen Mitarbeitenden ein und deckt den Filialbedarf bestmöglich, in genau dieser
Rangfolge.

## Grundprinzipien

### I. Compliance durch Konstruktion (NICHT VERHANDELBAR)

Jede Änderung, die eine Person einer Schicht zuordnet, MUSS denselben Compliance-Validator
durchlaufen: manuelle Zuordnung, Solver-Vorschlag, Übernahme einer offenen Schicht, Genehmigung
eines Schichttauschs und Veröffentlichung des Dienstplans.

- Harte Regeln (gesetzliche Grenzen aus ArbZG, JArbSchG, MuSchG, AufenthG sowie die
  Einsatzberechtigung nach Prinzip II) MÜSSEN die Änderung blockieren. Keine Rolle, kein
  API-Endpunkt, Import oder Batch-Job darf sie umgehen.
- Vereinbarungsregeln zwischen Restaurant und Mitarbeitenden (genehmigter Urlaub, Krankheit,
  vertragliche Höchststunden, Minijob-Verdienstgrenze, gemeldete Nichtverfügbarkeit) MÜSSEN
  Solver-Vorschläge und Schichttausch blockieren. Die Leitung darf über die Vertragsstunden
  hinaus oder in gemeldete Nichtverfügbarkeit nur einplanen, wenn die Person die Schicht annimmt;
  die Annahme wird protokolliert. Genehmigter Urlaub und Krankheit sind nie übersteuerbar.
- Weiche Regeln (Personalbedarf, Fairness, Wünsche, Unternehmensrichtlinien, gesetzliche
  Soll-Vorschriften wie ArbZG §11(4)) DÜRFEN nur von Filialleitung oder Admin mit schriftlicher
  Begründung übersteuert werden; die Übersteuerung wird im Audit-Log gespeichert.
- Ein Plan mit harter Verletzung DARF NICHT veröffentlicht werden.
- Ein Schichttausch MUSS beide Mitarbeitenden gegen alle ihre Regeln erneut prüfen und MUSS von
  der Leitung genehmigt werden; Mitarbeitende können gesetzliche Grenzen nicht einvernehmlich
  abbedingen.
- Der Validator MUSS serverseitig laufen; clientseitige Prüfungen dienen nur dem Komfort.

Begründung: Laut Aufgabenstellung dürfen nicht berechtigte Personen nie eingeplant werden, und der
Filialbedarf ist mit dem Arbeitszeitrecht abzuwägen. ArbZG-Verstöße kosten bis zu 30.000 EUR je
Verstoß (§22), Tätigkeit mit Lebensmitteln ohne IfSG-Bescheinigung bis zu 25.000 EUR (IfSG §73),
Beschäftigung ohne gültigen Aufenthaltstitel bis zu 500.000 EUR (SGB III §404).

### II. Berechtigung vor Zuordnung (NICHT VERHANDELBAR)

Mitarbeitende sind für eine Schicht nur berechtigt, wenn alle Anforderungen der Rolle, der Filiale
und ihrer Beschäftigtengruppe am Schichtdatum vorliegen und gültig sind. Startanforderungen:

- Bescheinigung nach §43 IfSG (Belehrung durch das Gesundheitsamt) für alle mit
  Lebensmittelkontakt: Küche, Spülküche sowie Service- und Barpersonal, das mit offenen
  Lebensmitteln umgeht. Bei erstmaliger Tätigkeit höchstens 3 Monate alt; danach kein Ablauf.
  Die Belehrung durch den Arbeitgeber nach §43(4) IfSG ist bei Beginn und alle 2 Jahre nötig.
- Kinder unter 15 Jahren und Vollzeitschulpflichtige DÜRFEN NICHT eingeplant werden
  (Kinderarbeitsschutzverordnung wird nicht abgebildet).
- Beschäftigte unter 18 Jahren: Erstuntersuchung (JArbSchG §32, nicht älter als 14 Monate); ohne
  Vorlage der Nachuntersuchung (§33) innerhalb von 14 Monaten nach Beginn keine Weiterbeschäftigung.
- Beschäftigte aus Drittstaaten: gültiger Aufenthaltstitel, der die Tätigkeit erlaubt (AufenthG
  §4a); Studierende aus Drittstaaten zusätzlich innerhalb der 140 Arbeitstage pro Jahr
  (AufenthG §16b(3)).
- Mutterschutzfristen (MuSchG §3) schließen die Einplanung für den gesamten Zeitraum aus.
- Weitere vom Betrieb konfigurierte Anforderungen (z. B. jährliche Hygieneschulung nach LMHV §4,
  jährliche Unterweisung nach DGUV Vorschrift 1 §4), hart oder weich je nach Konfiguration.

Die Gültigkeit MUSS zum Schichtdatum geprüft werden, nicht zum heutigen Datum. Das System MUSS vor
Ablauf warnen (Standard 30 Tage, konfigurierbar) und MUSS den Grund einer fehlenden Berechtigung
anzeigen. Abdeckungsregeln (z. B. mindestens ein ausgebildeter Ersthelfer je Filiale und Schicht,
DGUV Vorschrift 1 §26) werden je Schicht geprüft, nicht je Person.

### III. Regeln sind versionierte Daten mit Quelle

Gesetzliche und vertragliche Grenzen DÜRFEN NICHT als Konstanten in der Geschäftslogik stehen.

- Jede Regel wird als Datensatz gespeichert mit: Regeltyp, Parametern, Rechtsquelle (Gesetz und §),
  Geltungsbereich (Land, Bundesland, Filiale, Vertragsart, Beschäftigtengruppe, Tarifvertrag),
  Schwere (hart/weich) und Gültigkeitszeitraum (gültig ab / gültig bis).
- Eine Schicht wird stets gegen die am Schichtdatum gültige Regelsatz-Version geprüft.
- Geänderte Grenzen (ArbZG-Reform, neuer Mindestlohn oder Minijob-Grenze, ein Tarifvertrag) MÜSSEN
  sich durch eine neue Regelsatz-Version ohne Codeänderung abbilden lassen, sofern der Regeltyp
  existiert.
- Jede Abweichung vom gesetzlichen Standard (z. B. 10 statt 15 Sonntage, 9 Stunden Ruhezeit) MUSS
  auf den erlaubenden Tarifvertrag oder die Betriebsvereinbarung verweisen.
- Das Modell einer wöchentlichen Höchstarbeitszeit ist im November 2026 nur ein Entwurf (kein
  geltendes Recht). Es DARF nur als standardmäßig deaktivierter Regelmodus umgesetzt werden, der
  einen hinterlegten Tarifvertragsverweis erfordert.
- Feiertage MÜSSEN nach Bundesland (und ggf. Gemeinde) der Filiale ermittelt werden.

### IV. Ein Constraint-Modell, drei Planungsmodi

Manuelle Planung, automatischer Planvorschlag und Validierung MÜSSEN ein gemeinsames
Constraint-Modell nutzen.

- Timefold-Constraints bilden die Schwere ab: harte Regeln und Vereinbarungsregeln → Hard-Score; ungedeckter
  Personalbedarf → Medium-Score; Fairness und Wünsche → Soft-Score.
- Solver-Ergebnisse sind Vorschläge, keine Entscheidungen. Sie MÜSSEN vom selben Validator wie
  manuelle Änderungen geprüft werden, bevor sie als gültig angezeigt werden; die Planenden MÜSSEN
  jede vorgeschlagene Zuordnung annehmen, ändern oder ablehnen können.
- Fixierte (manuell gepinnte) Zuordnungen MUSS der Solver respektieren.
- Der Validator MUSS ohne Solver funktionieren, damit manuelle Planung auch bei langsamem,
  deaktiviertem oder fehlgeschlagenem Solver möglich ist. Das Lösen MUSS asynchron mit
  konfigurierbarem Zeitlimit laufen.

### V. Nachvollziehbare Entscheidungen und vollständiges Audit-Log

- Jede Verletzung und jede fehlende Berechtigung MUSS nennen: Regelname, Rechts- oder
  Richtlinienquelle (mit §), betroffene Person und Schicht(en), Messwert gegenüber Grenzwert und
  mindestens einen Lösungsvorschlag, sofern ableitbar.
- Meldungen MÜSSEN auf Deutsch, Englisch und Vietnamesisch verfügbar sein (Prinzip VIII).
- In ein nur anfügbares Audit-Log mit Akteur, Zeitstempel, Vorher/Nachher-Werten und Begründung
  MÜSSEN geschrieben werden: Zuordnungen, Übersteuerungen, Tauschanfragen und -entscheidungen,
  Veröffentlichung und nachträgliche Planänderungen, Änderungen an Nachweisen und Schulungen sowie
  Regelsatz-Änderungen.
- Die tatsächliche Arbeitszeit (Beginn, Ende, Dauer) MUSS je Schicht erfassbar und gegen die Regeln
  prüfbar sein: Gaststätten müssen sie bis zum Ablauf des 7. Tages aufzeichnen und 2 Jahre
  aufbewahren (MiLoG §17 i. V. m. SchwarzArbG §2a; ArbZG §16(2); BAG 1 ABR 22/21).

### VI. Test-First-Regelwerk (NICHT VERHANDELBAR)

- Jeder Regeltyp MUSS automatisierte Tests haben, die vor oder mit der Implementierung entstehen und
  mindestens abdecken: genau am Grenzwert, eine Minute darüber, Schichten über Mitternacht, geteilte
  Dienste, die Zeitumstellungen in Europe/Berlin, rollierende Zeiträume (Tag, Woche, Doppelwoche,
  Monat, Ausgleichszeitraum, Kalenderjahr) und Grenzen zwischen Regelsatz-Versionen.
- Zeiten MÜSSEN als UTC-Zeitpunkte plus Filial-Zeitzone (Europe/Berlin) gespeichert und mit
  `java.time` (`Instant`, `ZonedDateTime`) berechnet werden; `LocalDateTime` DARF NICHT für
  Dauerberechnungen verwendet werden.
- Für den Solver MUSS es Tests mit kleinen festen Datensätzen geben, die belegen, dass er nie eine
  Zuordnung liefert, die der Validator als harte Verletzung ablehnt.
- Ein Pull Request mit geänderter Regellogik DARF NICHT gemergt werden, solange ein Regeltest
  fehlschlägt.

### VII. Datenschutz durch Technikgestaltung (DSGVO)

- Gespeichert wird nur das Nötige zur Berechtigungsprüfung: Nachweisart, Ausstellungs- und
  Ablaufdatum, Prüfstatus und prüfende Person. Scans oder Kopien nur, wo das Gesetz den Arbeitgeber
  zur Aufbewahrung verpflichtet (Bescheinigung nach §43 IfSG, Kopie nach AufenthG §4a(5),
  ärztliche Bescheinigungen nach JArbSchG §41), und nur für berechtigte Rollen.
- Besondere Kategorien (Art. 9 DSGVO) MÜSSEN auf Schutzkennzeichen mit Gültigkeit reduziert werden,
  z. B. „MuSchG gilt", „Nachtarbeit bis 22:00 genehmigt", „Befreiung von Mehrarbeit nach SGB IX
  §207"; keine Diagnosen oder medizinischen Details.
- Rechtsgrundlage sind Art. 6(1)(b)/(c) und Art. 9(2)(b) DSGVO; §26(1) BDSG DARF NICHT als
  Grundlage genannt werden (EuGH C-34/21; BAG 8 AZR 209/21).
- Jede Kategorie personenbezogener Daten MUSS eine Aufbewahrungs- und Löschregel haben (z. B.
  Arbeitszeitnachweise mindestens 2 Jahre; Bescheinigungen Minderjähriger bei Austritt
  zurückgeben, JArbSchG §41). Mitarbeitende MÜSSEN ihre eigenen Daten einsehen können.
- Rollenbasierte Zugriffe MÜSSEN Daten auf das Nötige begrenzen: Admin (Zentrale), Filialleitung
  (nur eigene Filiale), Mitarbeitende (eigene Daten und eigener Dienstplan).
- Entwicklungs- und Demodaten MÜSSEN synthetisch sein; keine echten personenbezogenen Daten im
  Repository.

### VIII. Dreisprachig als Standard (DE / EN / VI)

- Die Oberfläche MUSS Deutsch, Englisch und Vietnamesisch unterstützen. Alle sichtbaren Texte
  MÜSSEN aus Message-Bundles stammen; kein fest codierter UI-Text. Ein Feature ist erst fertig,
  wenn seine Schlüssel in allen drei Sprachen existieren.
- Datum, Uhrzeit und Zahlen MÜSSEN gemäß gewählter Sprache formatiert werden; die Woche beginnt am
  Montag.
- Deutsche Rechtsbegriffe (z. B. Ruhezeit, Belehrung nach §43 IfSG) MÜSSEN im Original neben der
  Übersetzung erscheinen.
- Die Projektdokumentation wird auf Englisch (maßgeblich) verfasst, mit vietnamesischer und
  deutscher Übersetzung. Bei Abweichungen gilt der englische Text.

## Rechtliche Ausgangsbasis (Start-Regelsatz 2026-11)

Gesetzliche Standardwerte für die Regelsatz-Version `2026-11`. Sie sind Daten, kein Code
(Prinzip III). Quelle: Recherchebericht „Luật xếp ca nhà hàng Đức" (November 2026). Vor echtem
Einsatz MÜSSEN die Werte mit den amtlichen Texten abgeglichen werden.

| Bereich | Standardregel (Gastronomie, ohne Tarifbindung) | Quelle | Schwere |
|---------|-----------------------------------------------|--------|---------|
| Tageshöchstzeit | 8 Std. je Werktag (Mo–Sa); bis 10 Std., wenn Ø ≤ 8 Std. in 6 Kalendermonaten / 24 Wochen | ArbZG §3 | Hart: 10-Std.-Grenze; Ø 8 Std.: Warnung bis Periodenende |
| Ruhepausen | ≥ 30 Min. bei > 6 Std., ≥ 45 Min. bei > 9 Std.; Abschnitte ≥ 15 Min.; max. 6 Std. ohne Pause | ArbZG §4 | Hart |
| Ruhezeit | 11 Std.; Gastronomie 10 Std. bei Ausgleich durch ≥ 12 Std. Ruhe binnen 1 Monat / 4 Wochen; nach Tagen > 12 Std. volle 11 Std. | ArbZG §5(1)(2), §7(9) | Hart |
| Nachtarbeit | Nachtzeit 23:00–06:00; Nachtarbeitnehmer 8 Std./Tag, 10 Std. nur mit Ausgleich binnen 1 Monat / 4 Wochen | ArbZG §2, §6 | Hart |
| Sonntage | ≥ 15 beschäftigungsfreie Sonntage pro Jahr (≥ 10 nur per Tarifvertrag); Ersatzruhetag binnen 2 Wochen (Sonntag) / 8 Wochen (Feiertag) | ArbZG §11, §12 | Hart |
| Ersatzruhetag + 11 Std. | Ersatzruhetag soll mit 11 Std. Ruhezeit verbunden werden | ArbZG §11(4) | Weich |
| Geteilte Dienste | Zulässig; alle Teile zählen zur Tagesgrenze; Ruhezeit ab letztem Teil | ArbZG §3, §5 (in der Praxis umstritten) | Hart (Summen) |
| Minderjährige | 8 Std./Tag, 40 Std./Woche, 5-Tage-Woche; Pausen 30/60 Min.; Schichtzeit 11 Std. in Gaststätten; 12 Std. Ruhe; 06:00–20:00 (ab 16: bis 22:00); ≥ 2 freie Sonntage/Monat; Verbote an 25.12., 1.1., Ostersonntag, 1.5., 24./31.12. ab 14:00 | JArbSchG §§8, 11–18 | Hart |
| MuSchG | 8,5 Std./Tag, 90 Std. je Doppelwoche (unter 18: 8 Std. / 80 Std.); keine Arbeit 20:00–06:00, außer genehmigt bis 22:00; Sonn-/Feiertag nur mit Einwilligung; 11 Std. Ruhe | MuSchG §§3–6, §28 | Hart |
| Schwerbehinderung | Mehrarbeit nur, wenn keine Freistellung verlangt wurde | SGB IX §207 | Hart bei Kennzeichen |
| Minijob | Verdienst ≤ 603 EUR/Monat 2026 (633 EUR 2027) bei Mindestlohn 13,90 EUR (2026) / 14,60 EUR (2027) | SGB IV §8, MiLoG | Vereinbarungsregel (Prinzip I) |
| Werkstudierende | ≤ 20 Std./Woche im Semester (Ausnahmen: Semesterferien, abends/am Wochenende) | BSG-Rechtsprechung | Weiche Warnung |
| Arbeit auf Abruf | Schichten ≥ 4 Tage im Voraus; Mindesteinsatz 3 Std. | TzBfG §12 | Hart bei Abrufverträgen |
| Planvorlauf | Keine gesetzliche Frist; ≥ 4 Tage bei Abruf; Betriebsstandard 14 Tage | GewO §106, Praxis | Weich |

Hinweis Betriebsrat: Wo ein Betriebsrat besteht, bedürfen Dienstpläne (BetrVG §87(1) Nr. 2/3) und
die Planungssoftware selbst (§87(1) Nr. 6) seiner Zustimmung. Das Produkt MUSS konfigurierbare
Freigabeschritte für Pläne bieten.

## Technologie und Entwicklungsablauf

- Backend: Java (aktuelle LTS, 21 oder neuer) mit Spring Boot; Timefold Solver für Planvorschläge.
  TODO(DATABASE) und TODO(FRONTEND) werden in `/speckit-plan` entschieden.
- Ansichten für Mitarbeitende (eigener Plan, Verfügbarkeit, Tauschanfragen) MÜSSEN im mobilen
  Browser funktionieren (responsive Web; PWA optional).
- Architektur: Regelwerk und Validator liegen in einem Modul ohne Abhängigkeit von Web-,
  Persistenz- oder Solver-Code, damit sie einzeln testbar und vom Solver wiederverwendbar sind.
- Ablauf je Feature: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement`. Jede Spezifikation MUSS die betroffenen Regeln nennen.
- Reihenfolge: (1) Personalakten, Nachweise und Berechtigung; (2) Filialbedarf und manuelle
  Planung mit Live-Prüfung; (3) Dienstplanansicht und Tauschanfragen; (4) automatischer
  Planvorschlag mit Timefold; (5) Fairness-Berichte und Oberfläche für Regelsatz-Versionen. Eine
  spätere Stufe DARF erst beginnen, wenn die vorherige ihre Abnahmetests besteht.
- Code-Review: Jeder Pull Request wird von mindestens einem anderen Teammitglied geprüft; CI führt
  alle Tests bei jedem Pull Request aus.
- Definition of Done: Abnahmekriterien erfüllt, Regeltests grün, i18n-Schlüssel in DE/EN/VI,
  Audit-Ereignisse erzeugt, keine fest codierten Rechtswerte, Dokumentation aktualisiert.

## Governance

- Diese Verfassung hat Vorrang vor anderen Projektpraktiken. Jeder `/speckit-plan` MUSS einen
  Constitution Check gegen die Prinzipien I–VIII enthalten; Abweichungen MÜSSEN im Abschnitt
  Complexity Tracking begründet werden.
- Änderungen: als Pull Request, der diese Datei und die VI/DE-Übersetzungen ändert, von der
  Mehrheit des Teams genehmigt, mit neuer Version und Datum.
- Versionierung: MAJOR beim Entfernen oder Neudefinieren eines Prinzips; MINOR bei neuem Prinzip
  oder Abschnitt bzw. wesentlich erweiterter Anleitung; PATCH bei Formulierungen und
  Klarstellungen.
- Geänderte Rechtswerte gehören in die Regelsatz-Daten, nicht in diese Verfassung, sofern sich
  kein Prinzip ändert.
- Compliance-Review: Reviewer prüfen Pull Requests gegen die Prinzipien; das Team überprüft diese
  Verfassung zu Beginn jedes Sprints.
- Dies ist ein studentisches Projekt und keine Rechtsberatung. Rechtswerte MÜSSEN vor produktivem
  Einsatz mit den amtlichen Texten (gesetze-im-internet.de) abgeglichen werden.

**Version**: 1.1.0 | **Ratifiziert**: 2026-11-07 | **Zuletzt geändert**: 2026-11-07
