# Stage 2 — Resume & Profile Consistency

Single HTML file, no backend, no extension. Open `stage2-consistency/index.html` (or serve the repo with any static server).

## What it does
1. **Provenance** — records typing rhythm and paste events in the resume box (timing only, never key identity). Paragraphs are colored green = typed, gold = mixed, red = pasted. Signals: `paste_ratio`, `largest_paste_ratio`, `rhythm_cv`, `backspace_ratio`, `think_pauses`.
2. **Claim cross-check** — resume + cover letter + the LinkedIn Experience text the candidate pastes themselves are sent as one set to ChatGPT / Claude / Gemini (bring your own key, kept in `sessionStorage`). Returns positions on each side, inflated titles, date mismatches, contradictions with quotes. **Demo mode** replays a pre-computed result for the two fixture candidates so the stage demo never depends on network.
3. **Profile plausibility** — local rules on self-reported connections / followers / profile-created year.
4. **Score** — `0.30·provenance + 0.50·claims + 0.20·profile`, `>= 60` clears Stage 2.

AI-polished wording is never penalized; only paste provenance, factual contradictions and thin/new profiles move the score.

## Output (for Stage 3 / dashboard)
Written to `localStorage["trustfunnel.stage2.<candidate_id>"]`, `window.TrustFunnelStage2`, and the Copy JSON button.

```json
{
  "candidate_id": "DEMO-0177",
  "status": "flagged",                 // "cleared" | "flagged" | "error"
  "stage2_consistency_score": 22,
  "stage_cleared": false,
  "breakdown": {
    "provenance": { "score": 31, "weight": 0.3, "signals": { "paste_ratio": 0.98, "largest_paste_ratio": 0.98, "rhythm_cv": null, "backspace_ratio": 0, "think_pauses": 0, "typed_chars": 14, "pasted_chars": 706 } },
    "claims":     { "score": 18, "weight": 0.5, "positions_matched": 0, "positions_total": 2, "summary": "..." },
    "profile":    { "score": 20, "weight": 0.2, "signals": { "connections": 12, "followers": 9, "created_year": 2026 } }
  },
  "stage2_flags": [ { "code": "TITLE_INFLATED", "severity": "high", "message": "...", "evidence": {} } ],
  "trace": [ { "signal": "paste_ratio", "value": "98%", "delta": -59 } ],
  "model": "demo-fixture",
  "computed_at": "2026-09-19T18:00:00.000Z"
}
```

Flag codes: `PASTED_BLOCK`, `UNIFORM_TYPING`, `TITLE_INFLATED`, `DATE_MISMATCH`, `DOC_CONTRADICTION`, `COMPANY_NOT_ON_LINKEDIN`, `THIN_PROFILE`, `NEW_PROFILE`, `LINKEDIN_NOT_PROVIDED`.

## Demo script (60 s)
1. Click **Load demo: honest** → **Run** → 95, cleared, heatmap mostly green (one pasted skills line stays fine: AI polish is not punished).
2. Click **Load demo: fraud** → **Run** → 22, flagged: 98% pasted in one block, Intern on LinkedIn vs Senior Staff on resume, cover letter says six years vs a three-month internship, 12 connections, profile created this year.
3. Optional live moment: **Reset**, type two lines, then paste a paragraph — watch the paragraph turn red and the sparkline jump.
4. With a real key: pick ChatGPT / Claude / Gemini and run on any text.

## Fixtures
`DEMO-0142` Hana Ortiz (honest) and `DEMO-0177` Felix Marlow (fraud) live in the `FIXTURES` object near the bottom of `index.html`; edit there to change names or scores.
