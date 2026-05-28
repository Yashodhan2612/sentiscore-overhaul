# SentiScore UI Overhaul — Plan v2

Three workstreams stacked on top of the current prototype (light/dark mode + functional CTAs already shipped). Each section is self-contained: scope, decisions, file-level changes, and acceptance criteria. **No code has been written yet — this is the review draft.**

---

## Workstream A — Rename **CCI → ESS** (Extended SentiScore)

### Conceptual model

CCI was a placeholder ("Composite Confidence Index") and is being removed from the product surface. ESS replaces it as a **weighted average of three layered metrics**:

| Layer | Abbr | Full name | Already in codebase? |
|---|---|---|---|
| L1 | OSS | Overall Sentiment Score (earnings-call sentiment, the core call-derived score) | ✅ `DetailedScores.tsx`, `Playground.tsx` |
| L2 | NSS | News Sentiment Score | ✅ `DetailedScores.tsx` |
| L3 | SSS | Social Sentiment Score | ✅ `DetailedScores.tsx` |

**ESS = w₁·OSS + w₂·NSS + w₃·SSS**, default weights `0.5 / 0.3 / 0.2` (these surface in the Playground tab and a tooltip on the ESS chip — they should NOT be hardcoded across pages; centralize in `src/lib/ess.ts`).

This reframing is consistent with the existing `ESS_L1` row in `DetailedScores.tsx` (line 55) — that row stays, and we add `ESS_L2 (NSS-derived)` and `ESS_L3 (SSS-derived)` peers plus a final `ESS` composite that replaces `Composite CCI`.

### Files touched (8)

1. **`src/pages/Book.tsx`** — `getCCIColor` → `getESSColor`, `getCCIBg` → `getESSBg`, `row.cci` → `row.ess`, all `"CCI"` labels → `"ESS"`. Update `INITIAL_WATCHLIST` field name and `TICKER_UNIVERSE` preview field.
2. **`src/pages/Companies.tsx`** — `COMPANIES` array `cci` → `ess`, `cciDelta` → `essDelta`. Sort key `"cci"` → `"ess"`. Footer copy: `"ESS = Extended SentiScore (weighted L1 OSS + L2 NSS + L3 SSS)"`.
3. **`src/pages/MorningBrief.tsx`** — same field + column header rename.
4. **`src/pages/CompanyAnalysis.tsx`** — `company.cci` → `company.ess`, header chip label.
5. **`src/pages/company-tabs/Overview.tsx`** —
   - `"Composite CCI"` → `"ESS (Extended SentiScore)"`
   - `"CCI Evolution"` chart title → `"ESS Evolution"`, legend swatch label, `dataKey="cci"` → `dataKey="ess"`, gradient `id="cciGrad"` → `"essGrad"`.
   - **Add a small breakdown strip under the ESS number**: three mini-bars showing OSS / NSS / SSS contributions with their weights. Two-line tooltip explains the formula.
6. **`src/pages/company-tabs/DetailedScores.tsx`** — replace `Composite CCI` row with `ESS (Composite)`; keep `ESS_L1` row but rename to `OSS Composite (L1)` for clarity; insert `ESS_L2 (NSS, L2)` and `ESS_L3 (SSS, L3)` aggregated rows so the table reads top-down as a layered tree.
7. **`src/pages/company-tabs/Playground.tsx`** — rename composite slider/output from `CCI` to `ESS`. Add three weight sliders (`L1 weight`, `L2 weight`, `L3 weight`) that normalize to 1.0; this is the only place users can tweak the formula in the prototype.
8. **`src/pages/AlertsPage.tsx` + `src/pages/ReportsPage.tsx`** — alert rule strings (`"CCI Δ < -3 pts"`, `"CCI < 55"`, etc.) and the Pre-Earnings Brief template copy. Alert TYPE key `"cci"` → `"ess"` (also update `typeIcon` switch).

### New file

- **`src/lib/ess.ts`** — single source of truth:
  ```ts
  export const ESS_WEIGHTS = { L1_OSS: 0.5, L2_NSS: 0.3, L3_SSS: 0.2 };
  export const computeESS = (oss: number, nss: number, sss: number) =>
    Math.round(oss * ESS_WEIGHTS.L1_OSS + nss * ESS_WEIGHTS.L2_NSS + sss * ESS_WEIGHTS.L3_SSS);
  export const getESSColor = (v: number) =>
    v >= 75 ? "text-positive" : v >= 55 ? "text-caution" : "text-negative";
  ```

### Acceptance

- `grep -r "CCI\|cci\|Composite Confidence" src/` returns zero matches outside `ess.ts` migration comments.
- ESS chip on Overview reveals the L1/L2/L3 breakdown on hover.
- Playground weights sum to 1.0 and produce a recomputed ESS in real time.

---

## Workstream B — Full keyboard operability

### Goal

Every navigation action, every CTA, every modal, every list selection works from the keyboard alone. Discovery is **always one keystroke away** (`?` opens the shortcut overlay).

### Design decisions

1. **Two modes:** *Navigation mode* (default) and *Edit mode* (focus inside text input). Single-letter shortcuts only fire in navigation mode. Pressing `i` or `Enter` on a focused item enters edit mode; `Esc` exits.
2. **Use existing primitives.** `Cmd/Ctrl+K` (command palette) and `/` (ticker switcher) already exist in `TopNavigation.tsx`. Don't replace — extend.
3. **Visual cues, not noise.** A subtle `kbd` badge appears next to a control **only when the user has pressed `Alt` (or held `?` for 400 ms)**. This is the "show me the hotkeys" gesture. No permanent chrome.
4. **Roving tabindex for lists** (watchlist rows, alert cards, report rows, company table) — `j/k` or `↑/↓` to move, `Enter` to open, `x` to delete/dismiss, `Space` to select for multi-select operations.
5. **Modal focus trap.** All Dialogs already use Radix — confirm `Esc` closes and focus is restored to the trigger.

### Shortcut map (global)

| Keys | Action |
|---|---|
| `g b` | Go → Morning Brief |
| `g w` | Go → Book (Watchlist) |
| `g s` | Go → Screener (Companies) |
| `g c` | Go → Calendar |
| `g a` | Go → Alerts |
| `g r` | Go → Reports |
| `g p` | Go → Profile |
| `/` | Focus ticker switcher (existing) |
| `Cmd/Ctrl+K` | Command palette (existing) |
| `?` | Toggle shortcut cheatsheet overlay |
| `Alt` (hold) | Reveal inline `kbd` hints on visible controls |
| `t` | Toggle theme (light ↔ dark) |
| `Esc` | Close modal / clear selection / blur input |

### Page-level shortcuts

- **Book** — `a` add ticker (opens dialog), `j/k` move row, `Enter` open company, `x` remove from book, `v` toggle table/grid.
- **Companies (Screener)** — `j/k` move row, `Space` multi-select for comparison, `c` open Compare drawer (Workstream C), `f` focus filter input, `1–5` jump to sector chips, `Enter` open company.
- **Calendar** — `←/→` move week, `j/k` move event, `Enter` open ticker.
- **Alerts** — `j/k` move alert, `x` dismiss focused alert, `n` new rule, `Tab` switch between Triggered/My Rules.
- **Reports** — `1–4` pick template card, `g` generate (when template focused), `j/k` move recent row, `d` download focused.
- **Company Analysis** — `Tab`/`Shift+Tab` between sub-tabs, `1–7` direct jump to tab, `[`/`]` prev/next quarter.

### Implementation plan

1. **New file `src/hooks/useKeyboardNav.ts`** — registers a global `keydown` listener, tracks the `g`-prefix two-key sequence with a 600 ms timeout, dispatches a typed `KeyAction` event the page handlers can subscribe to. Skips when `document.activeElement` is an input/textarea/contenteditable unless the key is `Esc`.
2. **New file `src/components/ShortcutOverlay.tsx`** — full-screen overlay listing all shortcuts grouped by scope. Opens on `?`. Closes on `?` again or `Esc`. Built with the existing Dialog primitive; no new dependency.
3. **New file `src/components/KbdHint.tsx`** — small wrapper that renders a child + a positioned `<kbd>` chip when the global `altPressed` context is `true`. Drop these next to: Add Ticker, New Rule, Generate, theme toggle, and the top nav links.
4. **New context `src/contexts/KeyboardContext.tsx`** — exposes `{ altPressed, registerScope, currentScope }`. The page mounts a scope on entry so the global `g…` handlers know what's active and which page-level keys are wired.
5. **Roving tabindex helper `src/hooks/useRovingFocus.ts`** — pass it a ref to a list container and a key (`'j'/'k'` or `'ArrowDown'/'ArrowUp'`). Returns props to spread onto each row.
6. **Wire-up checklist (per page):**
   - Add `useRovingFocus` to the row container.
   - Subscribe to the `KeyAction` event for page-specific letters.
   - Drop `<KbdHint k="a">` and similar around primary CTAs.
7. **Focus styling** — add a single `:focus-visible` ring spec to `index.css` (`outline: 2px solid hsl(var(--primary)); outline-offset: 2px; border-radius: inherit`) so the active row is always visible. Already-present hover styles aren't enough.

### Visual cues — no UI breakage

- **Hint badges** appear only on `Alt` hold → no permanent layout shift.
- The shortcut overlay is a transient modal → no real-estate cost.
- Roving focus uses the existing `:focus-visible` token → no new colors.
- The status bar at the bottom-left gets a tiny `?` chip ("Press ? for shortcuts") that fades in after 8 s of inactivity on first session, then never again (localStorage flag).

### Acceptance

- A user can complete this workflow with hands on the keyboard the entire time:
  *Open app → `g w` → `a` → type "PLTR" → Enter → ticker added → `j j j` → Enter → `Tab` to "Detailed Scores" → `]` to next quarter → `g a` → `n` → fill rule → Enter → rule saved.*
- `?` overlay enumerates every shortcut listed above; nothing in the overlay is missing from the actual handlers.
- No visible chrome added in steady state. Diff against current screenshots in `tests/visual/` shows only intended changes (focus ring + status `?` chip on first session).

---

## Workstream C — Indexed + Benchmarked comparison

### Customer ask (verbatim)

> "If it is indexed and benchmarked against other companies, that'd be superb. Essentially, we want the ability for companies to be compared to each other and want to ideate and build how the UI would look when we are comparing companies together. The UI must allow comparing of 3–4 companies at the same time."

### ICP decision: **fixed-anchor 4-up comparison**

Buy-side analysts (our ICP) almost always compare **a primary name vs 2–3 peers** rather than four equal columns. So the UI treats the leftmost column as the **anchor** (highlighted, fixed position) and the others as **peers** (re-orderable, swappable). Cap at **4 total** — beyond that the column widths get too narrow to read sparklines comfortably at 13-inch laptop widths (verified with current `score-num` and `ticker-badge` sizes).

**Indexed view (toggleable):** every numeric value can be displayed in raw form OR rebased to the anchor = 100. So if AAPL's ESS is 78 and MSFT's is 84, the indexed view shows AAPL 100 / MSFT 108. This is the "benchmarked" lens the customer asked for.

### Entry points (multiple — meet users where they are)

1. **Companies (Screener)** — multi-select rows with `Space`, then `c` (or click the existing `Compare` button in the floating selection bar). Limit 4; if 5th selected, oldest peer is dropped with a toast.
2. **Company Analysis page** — new sub-tab `Benchmark` (between `Overview` and `Detailed Scores`) seeded with the current ticker as anchor + the 3 sector peers by default.
3. **Command palette** — new entry: "Compare tickers…" opens the 4-up directly.

### New page: `src/pages/ComparisonPage.tsx` at route `/compare?anchor=AAPL&peers=MSFT,GOOGL,META`

URL-driven so analysts can share/bookmark a comparison.

### Layout (4 fixed columns, scroll **vertically** through metric groups)

```
┌─────────────────┬───────────┬───────────┬───────────┬───────────┐
│                 │ AAPL ⚓   │ MSFT ✕    │ GOOGL ✕   │ + Add     │
│                 │ Anchor    │ Peer      │ Peer      │           │
├─────────────────┼───────────┼───────────┼───────────┼───────────┤
│ Sector          │ Tech      │ Tech      │ Tech      │           │
│ Mkt Cap         │ 3.52T     │ 3.11T     │ 2.04T     │           │
├─────────────────┼───────────┼───────────┼───────────┼───────────┤
│ ESS (Composite) │ 78  ━━━   │ 84  ━━━━  │ 72  ━━    │   <- bars indexed to peer-group max
│   L1  OSS       │ 78        │ 80        │ 70        │
│   L2  NSS       │ 71        │ 88        │ 68        │
│   L3  SSS       │ 68        │ 90        │ 71        │
├─────────────────┼───────────┼───────────┼───────────┼───────────┤
│ Tone Gap (↓)    │ 27 🟡     │ 14 🟢     │ 31 🔴     │
│ Mgmt Confidence │ 72        │ 78        │ 65        │
│ ...             │ ...       │ ...       │ ...       │
├─────────────────┼───────────┼───────────┼───────────┼───────────┤
│ ESS Evolution   │ ▁▂▃▄▅▆▇█ │ ▂▃▄▅▆▇██ │ ▂▃▄▃▄▅▄▅ │   <- 8-qtr sparklines, same y-scale
│ (8 quarters)    │           │           │           │
└─────────────────┴───────────┴───────────┴───────────┴───────────┘

[ Raw values | Indexed to AAPL=100 ]   [ Highlight: Best / Worst / Outliers ]
```

### Metric rows (grouped & collapsible)

1. **Identity** — Sector, Market Cap, Next Earnings, In Book
2. **Composite** — ESS, OSS (L1), NSS (L2), SSS (L3) + inline bars indexed to peer-group max
3. **Tone & Confidence** — Tone Gap, Mgmt Confidence, Uncertainty Index, Deflection Rate
4. **Outlook** — Forward-Looking Index, Growth Orientation
5. **External** — Inter-Quarter Signal, Insider Divergence, New Risks (count)
6. **Trends** — 8-qtr sparkline of ESS, OSS, NSS, SSS (one per row; shared y-axis across columns so the comparison is honest)
7. **Catalysts & Risks** — top-3 active items per company (collapsed by default; expand to read evidence)

Each group has a `[—]` collapser. State persists in URL hash.

### Visual conventions

- **Anchor column** has a subtle amber left border (`border-l-2 border-primary/50`) and the ⚓ icon next to its ticker.
- **Best-in-row** cell gets `bg-positive/10`. **Worst-in-row** gets `bg-negative/10`. Toggleable.
- **Indexed mode** shows the relative delta inline: `108` becomes `108 (+8)` in muted text. Anchor reads `100 (base)`.
- **Outliers** (≥1σ from peer mean, computed across the 3–4 selected) get a 🟠 dot in the corner. Toggleable.
- **Direction-aware coloring** — metrics where lower is better (Tone Gap, Uncertainty Index, Insider Divergence) flip the green/red convention. Already handled in `DetailedScores.tsx` via `lowerBetter` — reuse that flag from the centralized metric list.

### Empty / partial states

- 1 column selected → "Add 1–3 peers to compare" CTA centered.
- "+ Add" column always present as the rightmost cell until the cap is hit; clicking opens a Radix popover with ticker search (the same `TICKER_UNIVERSE` from `Book.tsx`).
- Removing a peer doesn't shift the anchor.
- Swapping anchor: dropdown chevron next to ⚓ on the anchor cell → "Make AAPL a peer / Make MSFT the anchor".

### Export & share

- **Copy link** button → URL with query params.
- **Export CSV** → flattened table (metrics in rows, tickers in columns).
- **Export PDF** → reuses the Reports template engine; new template id `"compare"`.

### Keyboard support (per Workstream B)

- `←/→` jump between columns
- `↑/↓` or `j/k` jump between metric rows
- `a` add peer / `x` remove focused peer / `s` swap anchor with focused peer
- `i` toggle Raw ↔ Indexed
- `b` toggle Best/Worst highlights
- `o` toggle Outliers
- `g` collapse/expand current group

### Files touched / new

- **NEW** `src/pages/ComparisonPage.tsx`
- **NEW** `src/components/PeerPicker.tsx` (Radix popover with the universe + recently-viewed)
- **NEW** `src/lib/peers.ts` (default peer suggestions by sector; outlier math)
- `src/App.tsx` — register `/compare` route
- `src/pages/Companies.tsx` — wire the existing `Compare` button to `navigate("/compare?…")`
- `src/pages/CompanyAnalysis.tsx` — add `Benchmark` sub-tab (renders a 1-anchor `<ComparisonPage>` embedded with auto-selected peers)
- `src/components/CommandPalette.tsx` — add "Compare tickers…" action

### Acceptance

- A user can land on `/compare?anchor=NVDA&peers=AMD,AVGO,QCOM` and immediately read 4 columns with full ESS breakdown, tone, outlook, and 8-qtr sparklines.
- Toggling **Indexed to NVDA=100** visibly rebases every numeric cell within ~16 ms (single React state flip, no refetch).
- "Best/Worst" highlights honour `lowerBetter` for direction.
- Adding a 5th peer drops the oldest (FIFO) with a toast: "Cap reached — dropped AMD."
- The view is reachable via Screener multi-select, Company Analysis sub-tab, and Cmd+K.
- Keyboard shortcuts above are all functional.

---

## Order of execution (recommended)

1. **Workstream A** (ESS rename) — small, isolated, unblocks copy in B and C.
2. **Workstream C** (Comparison) — biggest single value to the ICP; depends on A's centralized ESS lib.
3. **Workstream B** (Keyboard) — done last so it covers all the new surfaces from A + C in one sweep.

Estimated scope: ~1.5k LOC net, 4 new files, 10 modified files, 1 new route.

---

## Decisions (locked)

1. **ESS weights — read-only** — No custom weight controls. Instead, the ESS chip gets a small `ⓘ` icon (Lucide `Info`, `h-3 w-3 text-text-tertiary`). Hovering/clicking opens a Radix `Tooltip` with: *"ESS = 50% OSS (L1) + 30% NSS (L2) + 20% SSS (L3)"*. No inputs, no sliders outside the Playground tab.
2. **Compare cap — hard 4** — No responsive unlock. 4 columns max on all breakpoints.
3. **`g`-prefix** — Accepted trade-off. Documented in `?` overlay as: *"Works in navigation mode (not when a text field is focused)."*
4. **Sub-tab + dedicated route — both ship** — `Benchmark` sub-tab on `CompanyAnalysis` is an embedded `<ComparisonPage>` seeded with the current anchor + sector peers. No duplication; same component.
