---
name: cadillac-reporter-mode
description: Research workflow for enriching Steps of Cadillac F1 race cards with Cadillac-centric narrative events. Use when you need to gather stage-by-stage Cadillac developments (upgrades, operational background, incidents) and in-race special events that affected Cadillac, then turn them into structured notes or JSON-ready fields for a round.
---

# Cadillac Reporter Mode

## Overview

Use this skill when a round needs more than raw results. It tells an agent how to build a **Cadillac point-of-view event log** by combining official team narrative, FIA decision documents, timing/control data, and selective media reporting.

This skill is for **research and evidence collection**, but the output should stay **small and high-signal**. It does not replace the main importer in `DATA_FETCH_SKILL.md`; instead, it fills the narrative layer that APIs alone cannot explain.

Use it as a **single research workflow with multiple export targets**. The same evidence pass should be able to support both:
- a team-level historical reading for the round
- driver-level special notes for Bottas / Perez when the race view needs per-driver context

Crucial boundary:
- `cadillac.historicalContext` on the **Qualifying** surface must stop at the team state **before the race starts**.
- It may include build-up, practice, sprint, qualifying execution, deleted laps, upgrades, and pre-race operational context.
- It must **not** include race incidents, Safety Cars, opening-lap contact, tyre-strategy outcomes, finishing positions, or any explanation that only became true during Sunday's race.
- Those Sunday consequences belong in `cadillac.driverNotes.*` for the **Race** surface.

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

## Step 5 — Read Cadillac official coverage last
Only after media + FIA + data passes.

Use the official team site to:
- confirm exact upgrade wording
- collect direct driver or TP quotes
- understand how Cadillac tried to frame the same weekend

Do **not** let official optimism overwrite the outside reading unless the external narrative is plainly wrong on facts.

## Step 6 — Distill into Cadillac card fields
Treat the evidence notebook as one shared research packet, then export it into the field shape the product needs.

### A. Team-level output
Use this when the card needs the single Cadillac-wide historical reading.

Target field:
- `cadillac.historicalContext`

If the field is shown on the **Qualifying** surface, constrain it to:
- upgrade package introduced before or during qualifying
- revised setup direction seen before the race
- qualifying-specific execution issue
- practice / sprint / parc ferme context that shaped the grid position
- operational milestone that was already true before lights-out

Do not use `historicalContext` for:
- first-lap collisions
- Safety Car / VSC timing
- tyre strategy outcome in the race
- finish position interpretation
- any Sunday race narrative that belongs to `driverNotes`

### B. Driver-level output
Use this when the race card needs one special note per Cadillac driver.

Target fields:
- `cadillac.driverNotes.BOT`
- `cadillac.driverNotes.PER`

Use for:
- damage or reliability issue
- deleted lap / penalty / steward-linked effect
- strategy distortion
- tyre degradation pattern
- yellow / VSC / SC timing damage
- any one-off condition that changes how the driver's result should be read

Priority order for `driverNotes`:
1. the driver's defining race event or setback
2. the strategy shape that altered the race outcome
3. the result only as supporting context

That means the note should answer **why this finish happened**, not merely restate where the driver finished.

### C. Shared evidence packet
Do not research team and driver stories separately unless the existing evidence is clearly insufficient.

Default rule:
- research once
- classify evidence once
- export twice if needed

## Output schema (recommended)

Use this structure in notes or as a bridge before writing into round JSON:

```json
{
  "cadillacReporter": {
    "teamNarrative": {
      "historicalContext": "One short English paragraph that changes how the round should be read.",
      "confidence": "official|observed|reported|corroborated",
      "sources": ["team-or-media-url"]
    },
    "driverNotes": {
      "BOT": {
        "headline": "One short English note about Bottas's defining race condition.",
        "tag": "damage-limited",
        "confidence": "official|observed|reported|corroborated",
        "sources": ["..."]
      },
      "PER": {
        "headline": "One short English note about Perez's defining race condition.",
        "tag": "strategy-faded",
        "confidence": "official|observed|reported|corroborated",
        "sources": ["..."]
      }
    },
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
- `Perez finished P16 and remained outside the points.`
- `Bottas was P19 and the team still lacked pace.`
- `The Safety Car ruined Cadillac's plan.` in a qualifying `historicalContext`

Good:
- `Cadillac's debut qualifying was disrupted by a red flag and a straight-line loss on Bottas's car, making execution more notable than raw grid position.`
- `Shanghai still reflected an early-car cleanup weekend: sprint fuel and deployment issues framed a qualifying session where simply getting both cars out clean mattered.`
- `Suzuka mattered because Cadillac could finally integrate upgrades and show a small pace step, even if the midfield remained out of reach over one lap.`

Anti-pattern:
- Do **not** make `points window`, `midfield gap`, or `off the pace` the main clause unless no more race-specific cause is supportable.
- Season-long competitiveness can appear at the end of the sentence, but never replace the round-specific story.

### This is not a report — it is a compact interpretation layer
The goal is **not** to summarize the whole weekend.
The goal is to identify the smallest set of context that changes how the result should be read.

Default target per round:
- exactly `1` team-level key narrative
- exactly `1` driver note for `BOT`
- exactly `1` driver note for `PER`
- no extra supporting note unless absolutely necessary

Driver-note fallback ladder:
- first choice: race event, damage, reliability, safety-car timing, tyre offset, pit-window disruption
- second choice: battle, recovery shape, or stint pattern that defined the race
- last choice: bare finishing position or generic competitiveness summary

Length targets:
- `historicalContext`: about `35-55` words, usually `15-25%` shorter than your first draft
- `driverNotes.*.headline`: about `18-35` words

If two ideas compete, choose the one that best changes interpretation.
If an item does not change interpretation, cut it.
After drafting, compress once more by removing setup language, hedging, and any clause that does not change the reading.

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
- Can the draft be cut by another `15-25%` without losing the point?

## Recommended ultra-compact output

Write directly into round data when possible.

```json
{
  "cadillac": {
    "historicalContext": "One short English paragraph, ideally 35-55 words, capturing the key historical background that changes how Cadillac's result should be read.",
    "driverNotes": {
      "BOT": {
        "headline": "One short English note for Bottas.",
        "tag": "damage-limited"
      },
      "PER": {
        "headline": "One short English note for Perez.",
        "tag": "strategy-faded"
      }
    }
  }
}
```

## References

Load these when you need more detail:
- `references/source-map.md`
- `../DATA_FETCH_SKILL.md`

