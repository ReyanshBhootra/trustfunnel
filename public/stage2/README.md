# Stage 2 — Resume & Profile Consistency

Single HTML file, no backend, no extension. Lives in `public/stage2/` so the Vite app serves it at `/stage2/index.html` (`npm run dev` → http://localhost:5173/stage2/index.html). The dashboard's candidate flow links to it as "Open live consistency check".

Game-style flow: **Intro → Level 1 Resume → Level 2 LinkedIn → Level 3 Cross-check → Result** with a progress bar in the header. "Play demo: honest / fraud" on the intro loads a fixture candidate and walks the same levels.

## What it does
1. **Extraction** — resume + optional cover letter + the Experience section from the candidate's own LinkedIn PDF (parsed in-browser with pdf.js; paste fallback) go to ChatGPT / Claude / Gemini (bring your own key, kept in `sessionStorage`). The model returns every position with company, title, dates and employment type, per-company matches, contradictions with quotes, and a first-pass assessment of each company name. **Demo mode** replays a pre-computed extraction for the two fixture candidates.
2. **Company verification, live from the browser, no key** — every distinct company is looked up in **Wikidata** (is it an organization, founded year, dissolved year, official site, Wikipedia link) and **Clearbit's public company index** (exact-name → domain, then a favicon probe to see the site is reachable). Verdicts: `verified` (public record), `found` (domain only), `unverified` (nothing found), `vague` (Stealth Startup / Confidential / Self-employed), `suspicious` (no record and the name reads as a placeholder, or the dates are impossible for that company). Fixtures fall back to cached lookups if the network is down.
3. **Titles & dates** — model verdicts plus local logic: a seniority ladder (intern → junior → IC → senior → staff/principal/manager → director → VP → C-level) catches inflated titles even if the model misses them; dates are checked against the company's founded/dissolved years from Wikidata, against each other (end before start, future starts, overlapping full-time roles > 3 months) and against tenure (staff/director titles on too few years).
4. **Profile plausibility** — local rules on self-reported connections / followers / profile-created year.
5. **Score** — `0.50·titles & dates + 0.30·companies + 0.20·profile`, `>= 60` clears Stage 2. Any high-severity finding caps the titles & dates score at 60.

Polished wording is never penalized; only unverifiable companies, contradicted titles and dates, and thin/new profiles move the score.

## Output (for Stage 3 / dashboard)
Written to `localStorage["trustfunnel.stage2.<candidate_id>"]`, `window.TrustFunnelStage2`, and the Copy JSON button.

```json
{
  "candidate_id": "DEMO-0177",
  "status": "flagged",                 // "cleared" | "flagged" | "error"
  "stage2_consistency_score": 4,
  "stage_cleared": false,
  "breakdown": {
    "claims":    { "score": 0, "weight": 0.5, "positions_matched": 0, "positions_total": 3, "matches": [ ... ], "summary": "..." },
    "companies": { "score": 0, "weight": 0.3, "checked": [ { "company": "OpenAI", "verdict": "suspicious", "listed_on": ["resume"], "evidence": ["Wikidata Q21708200: ... founded 2015", "Founded 2015, but the resume starts there 2012-02"], "wikidata_id": "Q21708200", "founded": 2015, "domain": "openai.com" } ] },
    "profile":    { "score": 20, "weight": 0.2, "signals": { "connections": 12, "followers": 9, "created_year": 2026, "linkedin_source": "pdf", "pdf_pages": 1, "pdf_producer": "LinkedIn" } }
  },
  "stage2_flags": [ { "code": "TITLE_INFLATED", "severity": "high", "message": "...", "evidence": {} } ],
  "trace": [ { "signal": "company: OpenAI", "value": "suspicious", "delta": -45 } ],
  "stage3_handoff": {                  // exactly the shape stage3/app/models.py wants
    "stage_score": { "score": 4, "status": "failed", "flags": ["TITLE_INFLATED", "COMPANY_NOT_YET_FOUNDED"] },
    "candidate_profile": { "candidate_id": "DEMO-0177", "name": "Felix Marlow", "skills": [{ "name": "Kubernetes", "verified": false, "years": 0 }], "experience": [{ "title": "Senior Staff Software Engineer", "company": "Acme Cloud", "summary": "...", "years": 5, "verified": false }], "years_experience": 7, "applications_last_30d": 0, "application_history": [], "burst_ratio": 0 }
  },
  "model": "demo-fixture",
  "computed_at": "2026-09-19T18:00:00.000Z"
}
```

Flag codes: `TITLE_INFLATED`, `DATE_MISMATCH`, `DOC_CONTRADICTION`, `COMPANY_NOT_ON_LINKEDIN`, `COMPANY_NOT_YET_FOUNDED`, `COMPANY_ALREADY_DISSOLVED`, `DATE_IMPOSSIBLE`, `DATE_IN_FUTURE`, `OVERLAPPING_ROLES`, `TITLE_IMPLAUSIBLE_FOR_TENURE`, `COMPANY_LIKELY_FABRICATED`, `COMPANY_UNVERIFIED`, `VAGUE_EMPLOYER`, `THIN_PROFILE`, `NEW_PROFILE`, `LINKEDIN_NOT_PROVIDED`.

## Demo script (60 s)
1. **Play demo: honest** → Next → Next → **Run the check** → four tasks tick green → 97, CLEARED. Companies table shows Datadog and Squarespace verified live from Wikidata with founded years and domains.
2. **Check another candidate** → **Play demo: fraud** → Next → Next → **Run** → 4, FLAGGED: Acme Cloud has no public record and reads as a placeholder, "Stealth Startup" is not an employer, and OpenAI was founded in 2015 while the resume claims a 2012 role there; Senior Staff on the resume vs Intern on LinkedIn; cover letter says six years vs a three-month internship; 12 connections; profile created this year.
3. New data (anything that is not one of the two fixtures) needs a model: the page switches to the provider picker and asks for a key. Company lookups need no key.

## Fixtures
`DEMO-0142` Hana Ortiz (honest: Datadog, Squarespace) and `DEMO-0177` Felix Marlow (fraud: Acme Cloud, Stealth Startup, OpenAI) live in the `FIXTURES` object near the bottom of `public/stage2/index.html`; edit there to change names or scores.
