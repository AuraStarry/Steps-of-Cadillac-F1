# Source Map — Cadillac Reporter Mode

This file is a practical source map for digging up Cadillac-centric race-card events.

## 1. Official Cadillac sources

### Team news hub
- `https://www.cadillacf1team.com/news`

Typical page types:
- event preview
- free practice report
- qualifying report
- sprint report
- race report
- technical / milestone announcement

What to extract:
- official description of upgrades
- reliability issues acknowledged by the team
- operational milestones and background
- direct quotes from drivers / team principal

Known examples observed during research:
- `2026 CHINESE GRAND PRIX – SPRINT QUALIFYING REPORT` → notes Perez did not participate because of a fuel system issue detected earlier
- `2026 CHINESE GRAND PRIX — RACE REPORT` → first double-car finish milestone
- `2026 JAPANESE GRAND PRIX – QUALIFYING REPORT` and FP report → current-event framing

## 2. FIA official documents

### Season/event archive pattern
Start from the FIA F1 championship season page, then navigate to the GP event documents.

Useful entry pattern:
- `https://www.fia.com/documents/championships/fia-formula-one-world-championship-14/season/season-2026-...`

What to look for:
- deleted lap times
- infringement notices
- stewards decisions
- summons
- final classification
- revised starting grid

Why it matters:
- this is the highest-confidence source for penalties, documentable incidents, and procedural changes

## 3. OpenF1 API

### Docs
- `https://openf1.org/docs/`

### Practical endpoints

Resolve session key first:
- `https://api.openf1.org/v1/sessions?session_name=Race&year=2026&country_name=Japan`

Then inspect session context:
- `https://api.openf1.org/v1/race_control?session_key=11253`
- `https://api.openf1.org/v1/weather?session_key=11253`
- `https://api.openf1.org/v1/stints?session_key=11253`

Observed during research:
- `race_control?session_key=latest` returned official control messages for Japanese GP qualifying
- `weather?session_key=latest` returned minute-level weather records
- `stints?session_key=latest` returned tyre stint data

What each endpoint helps with:
- `race_control` → flags, SC/VSC, deleted laps, session notices
- `weather` → stable/dry vs volatile conditions
- `stints` → tyre strategy shape
- `intervals` / `pit` → race-flow detail when needed
- `team_radio` → optional quote/context, often sparse

## 4. Structured result backbone

### Jolpica / Ergast-compatible endpoints
See `../DATA_FETCH_SKILL.md` for the core pipeline.

Most useful endpoints:
- `https://api.jolpi.ca/ergast/f1/{year}/{round}/qualifying.json`
- `https://api.jolpi.ca/ergast/f1/{year}/{round}/results.json`
- `https://api.jolpi.ca/ergast/f1/{year}.json`

Use these for:
- session results
- grid/result structure
- round identity and date scaffolding

## 5. Media layer

Prefer these when you need explanation beyond official copy:
- Formula1.com
- Motorsport.com
- The Race
- RaceFans
- RacingNews365
- Racer

Suggested role for each:
- Formula1.com → paddock summary, broadly reliable recap
- Motorsport.com / The Race → technical and operational explanation
- RaceFans → incident/race recap and document linkage
- RacingNews365 / Racer → supplementary reporting and quotes

## 6. Extraction template

For each source, capture:
- `sourceUrl`
- `sourceType`
- `claim`
- `phaseOrSession`
- `who/what affected`
- `competitiveImpact`
- `confidence`

## 7. Sanity rules

- Team site explains the team's own framing, not necessarily blame allocation.
- FIA defines formal incident truth when a document exists.
- OpenF1 explains conditions and sequence, not intent.
- Media explains mechanisms and implications, but should not be treated as sole truth for major claims.
