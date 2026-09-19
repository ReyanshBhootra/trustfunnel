# Stage 2 — Resume & Profile Consistency

Single HTML file, no backend, no extension. Lives in `stage2-consistency/` at the repo root (same layout as `stage1-identity/`). Open `stage2-consistency/index.html` directly. A copy also lives in `public/stage2/` so the Vite app serves it at `/stage2/index.html` (`npm run dev` → http://localhost:5173/stage2/index.html). The dashboard's candidate flow links to it as "Open live consistency check".

Game-style flow: **Intro → Level 1 Resume → Level 2 LinkedIn → Level 3 Cross-check → Result** with a progress bar in the header. "Play demo: honest / fraud" on the intro loads a fixture candidate and walks the same levels.

## What it does
1. **Provenance** — records typing rhythm and paste events in the resume box (timing only, never key identity). Paragraphs are colored green = typed, gold = mixed, red = pasted. Signals: `paste_ratio`, `largest_paste_ratio`, `rhythm_cv`, `backspace_ratio`, `think_pauses`.
2. **LinkedIn PDF** — the candidate uploads the PDF LinkedIn generates from their own profile (Profile → More → Save to PDF; the steps are written on the page). pdf.js reads it in the browser, the Experience section is extracted and shown for review. Fallback: paste the Experience text. No scraping, nothing uploaded anywhere.
3. **Claim cross-check** — resume + cover letter + the extracted LinkedIn Experience are sent as one set to ChatGPT / Claude / Gemini (bring your own key, kept in `sessionStorage`). Returns positions on each side, inflated titles, date mismatches, contradictions with quotes. **Demo mode** replays a pre-computed result for the two fixture candidates so the stage demo never depends on network.
4. **Profile plausibility** — local rules on self-reported connections / followers / profile-created year.
5. **Score** — `0.30·provenance + 0.50·claims + 0.20·profile`, `>= 60` clears Stage 2.

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
    "profile":    { "score": 20, "weight": 0.2, "signals": { "connections": 12, "followers": 9, "created_year": 2026, "linkedin_source": "pdf", "pdf_pages": 1, "pdf_producer": "LinkedIn" } }
  },
  "stage2_flags": [ { "code": "TITLE_INFLATED", "severity": "high", "message": "...", "evidence": {} } ],
  "trace": [ { "signal": "paste_ratio", "value": "98%", "delta": -59 } ],
  "stage3_handoff": {                  // exactly the shape stage3/app/models.py wants
    "stage_score": { "score": 22, "status": "failed", "flags": ["PASTED_BLOCK", "TITLE_INFLATED"] },
    "candidate_profile": { "candidate_id": "DEMO-0177", "name": "Felix Marlow", "skills": [{ "name": "Kubernetes", "verified": false, "years": 0 }], "experience": [{ "title": "Senior Staff Software Engineer", "company": "Acme Cloud", "summary": "...", "years": 5, "verified": false }], "years_experience": 7, "applications_last_30d": 0, "application_history": [], "burst_ratio": 0 }
  },
  "model": "demo-fixture",
  "computed_at": "2026-09-19T18:00:00.000Z"
}
```

Flag codes: `PASTED_BLOCK`, `UNIFORM_TYPING`, `TITLE_INFLATED`, `DATE_MISMATCH`, `DOC_CONTRADICTION`, `COMPANY_NOT_ON_LINKEDIN`, `THIN_PROFILE`, `NEW_PROFILE`, `LINKEDIN_NOT_PROVIDED`.

## Demo script (60 s)
1. **Play demo: honest** → Next → Next → **Run the check** → three tasks tick green → 95, CLEARED, no findings.
2. **Check another candidate** → **Play demo: fraud** → Level 1 map is all red → Next → Next → **Run** → 22, FLAGGED: 98% pasted in one block, Intern on LinkedIn vs Senior Staff on resume, cover letter says six years vs a three-month internship, 12 connections, profile created this year.
3. Optional live moment: **Start**, type two lines, then paste a paragraph and watch it turn red. On Level 2 drop a real LinkedIn PDF and open "Review extracted text".
4. New data (anything that is not one of the two fixtures) needs a model: the page switches to the provider picker and asks for a key. Keys stay in `sessionStorage`.

## Fixtures
`DEMO-0142` Hana Ortiz (honest) and `DEMO-0177` Felix Marlow (fraud) live in the `FIXTURES` object near the bottom of `stage2-consistency/index.html`; edit there to change names or scores.
