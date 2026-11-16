---
name: dax-authoring
description: "Use when authoring or testing bounded DAX queries for a verified Power BI semantic-model connector."
---
# DAX authoring

Use [rayfin-connectors](../rayfin-connectors/SKILL.md) to verify the intended model and discover actual tables, columns, measures, relationships, and date table. Do not invent a sales schema or model measures.

- Use existing measures first: `[Measure]` and fully qualified `'Table'[Column]`.
- `EVALUATE` requires a table expression; use `ROW` for scalar probes.
- Use one `DEFINE` block for query variables/measures. `CALCULATE` takes a scalar, `CALCULATETABLE` a table.
- For grouped aggregates use `SUMMARIZECOLUMNS`: grouping columns, filters, then named expressions. Use `TREATAS` for explicit filter values where appropriate.
- Preserve BLANK and numeric values; do not use `FORMAT`, string decoration, or numeric coercion to fix a decoding error. Compare CLI/SDK versions and the original measure first.
- Check date-table continuity, relationships, fiscal/calendar semantics, and filter context before time-intelligence calculations. Use the requested reporting period, not the current date by assumption.

## Bound every query

Every semantic-model input must specify a positive integer `resultSetRowCountLimit`. Aggregate to the required grain and bound detail/member discovery too; there is no safe implicit row cap.

For a display limit of N rows, request at most N+1 and treat more than N returned rows as a visible over-limit error asking for narrower filters. Never silently slice an over-limit response. A service cap can truncate without an error, so a response at the cap is not evidence of completeness. `TOPN` can return ties; use a unique tie-breaker where the model supports one and retain the envelope limit and overflow check. Do not calculate totals from a potentially truncated detail set.

A schema-independent one-row transport probe:

```json
{ "query": "EVALUATE ROW(\"Probe\", 1)", "resultSetRowCountLimit": 1 }
```

This proves only transport. Real app queries must use the verified model and the N+1 policy above.

## Execute, inspect, integrate

Save the JSON input envelope inside the app root, then run:

```bash
npx rayfin connector invoke <alias> executeQuery --file <query.query.json>
```

Read installed guide `cli/connectors/invoke.md` and the version-matched semantic-model SDK docs for result shapes. Inspect normalized status, column names/types, row count, BLANKs, units, totals, dates, and actual values. Fix and rerun before UI integration. An `overflow` result error is a failed query, not proof the row cap was reached.

Use the exact envelope in the app, check errors explicitly, and also test through the deployed browser: the CLI's direct developer transport is not the deployed caller's route. Use [query-design](../query-design/SKILL.md) for presentation boundaries.
