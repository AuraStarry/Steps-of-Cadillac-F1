# AGENT.md — Repository Rules for AI Agents

This file is a hard rulebook for any AI agent working in this repository.

## 1) Do NOT delete explanatory comments by default
- Files may contain long comments/docblocks that encode business logic intent.
- These comments are part of maintainability and review context, not decoration.
- **Do not remove, shorten, or “clean up” these comments** unless the related code path is removed.

## 2) Allowed comment changes
You may edit comments only when one of these is true:
1. The underlying logic changed and comments must be updated for correctness.
2. The underlying logic was deleted, so obsolete comments can be deleted with it.
3. There is an objectively incorrect statement in the comment.

## 3) Benchmark logic file protection
- `src/lib/cadillacQualifyingBenchmark.js` is a protected logic/spec bridge.
- Keep its explanatory comments and formula notes intact.
- If refactoring, preserve equivalent comments in the new location.

## 4) If unsure
- Prefer keeping comments.
- Add new comments rather than deleting existing rationale.
