---
name: query-design
description: "Use to separate source aggregation and filtering from typed presentation, including semantic-model grains, totals, and bounded results."
---
# Query design

Source queries compute meaning; TypeScript shapes verified results; existing React/Recharts components render them. This guidance does not require another visual library or prebuilt hooks.

| Concern | Owner |
| --- | --- |
| Measures, grouping grain, time context, authoritative totals | Source/DAX |
| High-cardinality filters and payload bounds | Source query |
| Merging verified result sets, labels, display order | TypeScript |
| Number/date/currency formatting, colors, layout | Existing UI components |

Read [rayfin-connectors](../rayfin-connectors/SKILL.md) before source setup and [dax-authoring](../dax-authoring/SKILL.md) for DAX syntax/testing.

- Fetch the grain the display needs, not lower-grain rows to aggregate in the browser. Keep detail and summary queries separate; align their filters and measure definitions.
- Compute non-additive totals (ratios, averages, distinct counts) at the source. Never sum them or infer totals from capped/paged detail rows.
- Preserve typed numeric values and BLANKs. Format at render time; do not use DAX `FORMAT`, `UNION` totals into detail, or create decorative strings in source results.
- Apply high-cardinality filters at the source. Client filtering is appropriate only for a complete, explicitly bounded low-cardinality dataset.
- Cross-filtering narrows results. Cross-highlighting needs a separately aggregated subset at the baseline grain; filtering aggregated baseline rows cannot recreate that subset.
- Use stable source ordering for reproducible probes, with deterministic tie-breakers. Presentation-only sort/label changes should not rewrite business calculations.
- Require a positive semantic-model row cap and the N+1 visible-over-limit check described in DAX guidance. A truncated result is not a complete dashboard.
- Keep real query failures visible and prevent stale responses from replacing newer filter results. Never convert permission or configuration failure into an empty-success state.

Before shipping, trace a representative displayed value to the exact executed input, source result, and presentation transform. Check units, percent scales, date boundaries, null handling, empty results, over-limit behavior, and related-query consistency. Build success alone cannot establish those facts.
