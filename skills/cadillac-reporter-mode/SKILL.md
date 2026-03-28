---
name: cadillac-reporter-mode
description: Research workflow for enriching Steps of Cadillac F1 race cards with Cadillac-centric narrative events. Use when you need to gather stage-by-stage Cadillac developments (upgrades, operational background, incidents) and in-race special events that affected Cadillac, then turn them into structured notes or JSON-ready fields for a round.
---

# Cadillac Reporter Mode

## Overview

Use this skill when a round needs more than raw results. It tells an agent how to build a **Cadillac point-of-view event log** by combining official team narrative, FIA decision documents, timing/control data, and selective media reporting.

This skill is for **research and evidence collection**, but the output should stay **small and high-signal**. It does not replace the main importer in `DATA_FETCH_SKILL.md`; instead, it fills the narrative layer that APIs alone cannot explain.

## When to use this skill

Trigger this skill when the task involves any of these:
- 補強某一站 race card 的 `cadillac` 敘事欄位
- 想新增「記者模式」或「事件模式」去打撈 Cadillac 視角資訊
- 需要整理 upgrade / operations / incidents / race-affecting events
- 需要回答「Cadillac 這週末到底發生了什麼」
- 需要把多來源資料交叉驗證後，輸出成可寫入 round JSON 的結構化筆記

Do **not** use this skill for plain classification data like finishing order or qualifying times only; use `DATA_FETCH_SKILL.md` first for that.

## Source priority ladder

Always collect from sources in this order. Higher sources define the factual spine; lower sources add explanation or color.

### Tier 1 — Official Cadillac team narrative
Primary use: team framing, upgrade mentions, setup comments, operations background, direct driver/TP quotes.

Preferred pages:
- `https://www.cadillacf1team.com/news`
- specific event pages such as:
  - free practice report
  - qualifying report
  - sprint / race report
  - pre-event preview

What this tier is good for:
- what parts were newly brought to a circuit
- how the team described its own progress
- official wording around issues and milestones
- operational context such as first double finish, shakedown, facility expansion, staffing, power-unit timeline

What this tier is weak at:
- it may understate blame or tactical mistakes
- it may omit unflattering internal problems

### Tier 2 — FIA official documents
Primary use: incident truth, deleted laps, penalties, summons, stewards decisions, procedural causes.

Entry point:
- FIA decision documents archive for each F1 season/event on `fia.com`

Look for documents matching:
- stewards decision
- infringement
- deleted lap time
- summons
- race director event notes
- starting grid
- final classification

Use this tier to answer:
- Did Cadillac lose positions because of a deleted lap?
- Was there a collision ruling, warning, reprimand, or penalty?
- Was an unusual result caused by steward action rather than pace?

### Tier 3 — OpenF1 session context
Primary use: reconstructing what affected Cadillac during the session in near-real terms.

Docs:
- `https://openf1.org/docs/`

High-value endpoints:
- `https://api.openf1.org/v1/sessions?...` → find the session key for the round/session
- `https://api.openf1.org/v1/race_control?session_key=...` → flags, SC/VSC, deleted laps, official messages
- `https://api.openf1.org/v1/weather?session_key=...` → wind, temperature, rainfall context
- `https://api.openf1.org/v1/stints?session_key=...` → tyre stint structure
- `https://api.openf1.org/v1/pit?...` → pit timing if needed
- `https://api.openf1.org/v1/intervals?...` → gaps / race flow if needed
- `https://api.openf1.org/v1/team_radio?...` → rare but useful when available

Use this tier to answer:
- Was there rain risk, red flag, yellow, VSC, SC, or session interruption?
- Did tyre sequence or stint length shape Cadillac’s race?
- Did timing/weather conditions make one session unusually noisy?

### Tier 4 — Structured result APIs
Primary use: quick spine for schedule, grid, qualifying, race order.

Preferred sources:
- Jolpica / Ergast-compatible endpoints already documented in `DATA_FETCH_SKILL.md`

Use this tier for:
- qualifying and race tables
- schedule and round identity
- basic contextual backbone before deeper reporting

### Tier 5 — Reputable media interpretation
Primary use: explain *why* something happened when official sources are thin.

Preferred outlets:
- Formula1.com
- Motorsport.com
- The Race
- RaceFans
- RacingNews365
- Racer

Use sparingly and only after Tier 1-4 are checked.

Rules:
- never let a media claim outrank FIA documents on incidents
- never let a media claim outrank Cadillac’s own site on what the team officially announced
- when media adds a claim not found elsewhere, mark it as `reported` rather than `confirmed`

## Research workflow

## Step 1 — Build the round spine first
Before looking for narrative, collect the basics:
1. identify `year`, `round`, `grandPrixName`
2. pull qualifying + race result backbone from Jolpica
3. determine which sessions matter for the story:
   - FP / Qualifying / Sprint Qualifying / Sprint / Race
4. create a blank event notebook with four buckets:
   - `stageEvents`
   - `specialSessionEvents`
   - `evidence`
   - `openQuestions`

## Step 2 — Read Cadillac’s own sequence of reports in weekend order
Read the Cadillac pages in this order when available:
1. pre-event preview
2. FP report
3. qualifying / sprint qualifying report
4. sprint report
5. race report

Extract only claims that matter to the round card:
- new part or setup direction
- reliability issue
- operational milestone
- direct cause cited by the team
- driver quote that explains effect, not generic emotion

Write each item as a candidate event with:
- `phase`: `build-up | practice | qualifying | sprint | race | post-race`
- `title`
- `summary`
- `sourceType: official-team`
- `confidence: official`

## Step 3 — Check FIA documents for hard incident truth
Search the relevant FIA event page for any Cadillac-driver documents.

Targets:
- deleted lap times
- collisions / causing a collision
- unsafe release
- impeding
- parc fermé or starting procedure changes
- revised classification / revised grid

When found, add a normalized note:
- `whatHappened`
- `whoWasAffected`
- `competitiveImpact`
- `documentType`
- `documentTitle`
- `sourceType: fia`
- `confidence: official`

If FIA contradicts team wording, keep both, but factual event outcome follows FIA.

## Step 4 — Use OpenF1 to reconstruct session conditions
Use OpenF1 after the official reading, not before.

Suggested sequence:
1. resolve the correct `session_key` via `sessions`
2. query `race_control`
3. query `weather`
4. query `stints` for race or long-run logic
5. only query extra endpoints when needed

Look for events that changed Cadillac’s conditions:
- red flag interrupted final run plan
- yellow flag ruined last flying lap
- track evolution favored later runners
- VSC / SC changed strategic windows
- rain risk changed tyre/setup behaviour
- tyre degradation forced compromised stint shape

Write these as **effects**, not raw telemetry dumps.

Bad:
- `track_temperature was 32.4C`

Good:
- `Qualifying ran in stable, dry conditions with low rain risk, so Cadillac's deficit is more likely pace-limited than weather-distorted.`

## Step 5 — Use media only to close explanation gaps
Only after official + data passes.

Media is most useful for:
- why an upgrade was meaningful aerodynamically
- how the paddock interpreted an incident
- operational background that the team mentions only partially
- whether a driver clash or reliability issue was seen as systemic or isolated

When using media:
- prefer 2 independent outlets for consequential claims
- store the claim with `confidence: reported`
- upgrade to `confidence: corroborated` only if another independent source supports it

## Step 6 — Distill into Cadillac card fields
Final output should separate **Cadillac development story** from **weekend disruption story**.

### A. Stage events
These are Cadillac-centric progress markers.

Use for:
- upgrade package introduced
- revised setup direction
- first double finish
- new process milestone
- operations context that explains present performance

### B. Special session events
These are events that affected Cadillac during the weekend.

Use for:
- fuel system issue
- deleted lap
- teammate contact
- red flag / yellow / VSC timing damage
- rain or track evolution effect
- pit / strategy distortion

## Output schema (recommended)

Use this structure in notes or as a bridge before writing into round JSON:

```json
{
  "cadillacReporter": {
    "stageEvents": [
      {
        "phase": "qualifying",
        "title": "Cadillac brought a revised diffuser package",
        "summary": "The team framed Suzuka as another step in its aggressive early-season development cycle.",
        "competitiveImpact": "Aimed to reduce rear instability in medium/high-speed sections.",
        "sourceType": "official-team",
        "confidence": "official",
        "sources": ["team-report-url"]
      }
    ],
    "specialSessionEvents": [
      {
        "session": "race",
        "title": "Perez-Bottas contact damaged Bottas floor",
        "summary": "Intra-team contact compromised Bottas's car and shaped the rest of his race.",
        "competitiveImpact": "Floor damage reduced pace and limited recovery potential.",
        "sourceType": "fia+media",
        "confidence": "corroborated",
        "sources": ["fia-doc-or-team-url", "media-url"]
      }
    ],
    "evidence": {
      "officialTeam": [],
      "fia": [],
      "openf1": [],
      "media": []
    },
    "openQuestions": []
  }
}
```

## Writing rules

### Prefer causal language over generic recap
Bad:
- `Cadillac had a difficult weekend.`

Good:
- `Cadillac's qualifying ceiling was capped by outright pace, while the race story was further distorted by teammate contact and floor damage.`

### This is not a report — it is a single-turning-point layer
The goal is **not** to summarize the whole weekend.
The goal is to identify the **one** thing a reader must know so the data gains historical meaning.

Default target per round:
- exactly `1` key narrative
- optional `0-1` supporting note only if absolutely necessary
- total reading time: roughly `10-20 seconds`

If two ideas compete, choose the one that best changes how the result is interpreted.
If an item does not change interpretation, cut it.

### Distinguish four confidence levels
- `official` → team site or FIA document directly states it
- `observed` → strongly supported by timing / race control / weather data
- `reported` → stated by one reputable media source
- `corroborated` → supported by 2+ independent sources or official + data

### Keep event granularity severe
A round card should usually end up with:
- `1` total key item
- optional `0-1` open question

If everything becomes an event, the story loses shape.

## Fast checklist

For each round, ask:
- What is the **single most important piece of historical context** that changes how this result should be read?
- Is that context mainly about progress, disruption, or both at once?
- What background context makes this one point historically meaningful?
- Which claims are official, observed, reported, or corroborated?
- What is the one sentence worth keeping after everything else is forgotten?

## Recommended ultra-compact output

Write directly into round data when possible.

```json
{
  "cadillac": {
    "historicalContext": "One short English paragraph capturing the key historical background that changes how Cadillac's result should be read."
  }
}
```

## References

Load these when you need more detail:
- `references/source-map.md`
- `../DATA_FETCH_SKILL.md`
