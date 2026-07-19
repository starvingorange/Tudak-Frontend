# Design reference (frozen)

These files are the original exports from a Claude design session. They are **static HTML mockups**, not part of the Next.js build — each screen was exported as a separate fully-static file per light/dark variant, with every color hardcoded as a literal hex value.

They're kept here only as a visual/behavioral reference. The real, maintained implementation lives in `src/` (single components driven by CSS variables from `src/tokens/`, dark mode = variable swap via the `.dark` class). When these disagree, `src/` wins.

- `main/`, `debates/`, `votes/` — the `.dc.html` mockups, grouped by the domain they informed.
- `support.js` — the original Claude-design preview harness (`x-dc` custom element runtime). Not used by the app.
- `styles.css` — the original combined token stylesheet the mockups linked to for live-preview purposes.
- `components/core.card.html` — a preview harness for the shared Button/Card/CategoryBadge/PollBar/SectionHeader/VsBar primitives, superseded by `src/components/ui/`.
