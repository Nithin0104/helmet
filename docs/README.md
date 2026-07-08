# APEXLINE — Build Plan (Phased)

This folder breaks the [`../ARCHITECTURE.md`](../ARCHITECTURE.md) master plan into
executable phases. Each phase is a standalone doc with its goal, exact deliverables,
a task checklist, and how to verify before moving on.

| Phase | Doc | Goal | Depends on |
| --- | --- | --- | --- |
| 0 | [phase-0-foundations.md](./phase-0-foundations.md) | Scaffold Vite+React+TS, providers, tokens, hooks, data seam | — |
| 1 | [phase-1-primitives.md](./phase-1-primitives.md) | Port the ~29 design-system primitives + Showcase page | Phase 0 |
| 2 | [phase-2-composites.md](./phase-2-composites.md) | Composites (header/footer/product card…) + SiteLayout | Phase 1 |
| 3 | [phase-3-pages.md](./phase-3-pages.md) | Assemble Home / Shop / Product / Cart / Checkout | Phase 2 |

## How we work each phase
1. Read the phase doc + pull the relevant DC sources via the design MCP (`get_file`).
2. Implement the deliverables.
3. Run the phase's **Verify** checklist (`tsc`, `build`, drive it in the browser).
4. Only then advance — later phases assume earlier ones are green.

## Guiding principles
- **CSS variables for tokens/accent** — components read `var(--accent…)`, never hardcode hex.
- **Config-first & future-proof primitives** — see Phase 1. Every primitive audits the original
  DC `data-props`/ConfigPanel controls and *extends* them with sensible extra props (sizes, states,
  handlers) so the component library outlives its first use. Additions must be optional with safe
  defaults — never break the minimal call site.
- **Content is data** — mock content lives in `src/data/*`, the seam a real API drops into later.
