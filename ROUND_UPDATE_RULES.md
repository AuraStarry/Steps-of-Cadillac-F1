# ROUND_UPDATE_RULES.md — Steps of Cadillac F1

> Purpose: prevent cross-contamination between Qualifying context and Race narrative when updating round JSON.

## Hard boundary

`cadillac.historicalContext` is **Qualifying-only** context.

It exists to explain how to read Cadillac's grid position **before Sunday's race begins**.

Allowed in `historicalContext`:
- pre-event background
- upgrade package introduction
- practice learning
- sprint effects that changed the qualifying read
- qualifying execution issues
- deleted laps / FIA qualifying rulings
- parc fermé / setup direction already known before lights-out

Forbidden in `historicalContext`:
- race incidents
- first-lap contact
- Safety Car / VSC timing
- tyre strategy outcomes
- pit-lane penalties served in the race
- race finish interpretation
- anything that became true only after Sunday's race started

Those belong in:
- `race.entries` for classification data
- `cadillac.driverNotes.*` for driver-specific race interpretation

## Round update procedure

When updating a round after the Grand Prix:

1. Update `race.entries` with official race classification.
2. Add or revise `cadillac.driverNotes.BOT/PER` for race-specific causes.
3. Do **not** edit `cadillac.historicalContext` unless:
   - the previous text was factually wrong for qualifying, or
   - new evidence changes the pre-race reading itself.
4. Before commit, run this check:
   - If the sentence mentions Sunday race outcomes, penalties served in-race, SC/VSC timing, tyre outcome, or finishing position logic, it must not be in `historicalContext`.

## Key Context quality gate

Before a new qualifying `historicalContext` is accepted, it must pass all of these checks:

1. It names the **behind-the-result reason** first: upgrade read, practice disruption, reliability limitation, setup window, session execution, or outside competitive shift.
2. It uses grid positions, gaps, Q1/Q2 cutoffs, or “both cars out in Q1” only as supporting evidence, not as the main point.
3. It includes at least one piece of context a viewer would not learn merely by watching the qualifying classification.
4. It can answer: “What changed how Cadillac's qualifying should be interpreted?”

Reject and rewrite if the paragraph is mainly a tidy recap of the session result.

## Report-back requirement

When reporting a qualifying update, include a short `Key Context audit` with:

- the causal angle kept for `historicalContext`
- the raw-result recap that was deliberately avoided or demoted
- the evidence class used (`official`, `observed`, `reported`, or `corroborated`)

This audit is part of the update procedure, not optional polish.

## Safe mental model

- `historicalContext` = "Why should I read the qualifying result this way?"
- `driverNotes` = "Why did this race result happen this way?"

If a sentence answers the second question, it does not belong in `historicalContext`.
