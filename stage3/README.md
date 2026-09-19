# Stage 3 — Fit & History Verification + Scoring Engine

Teammate 3's slice of TrustFunnel. Two jobs:

1. **Stage 3 itself** — is this candidate a good match, and have we seen them before?
2. **The scoring engine** — combine all three stages into the one number the
   recruiter dashboard ranks by.

## Run it

```bash
python3 -m venv .venv && .venv/bin/pip install -r stage3/requirements.txt
.venv/bin/uvicorn stage3.app.main:app --reload --port 8000
```

First boot downloads ~80MB of model weights, then caches them. Everything runs
on-device — no API key, no network dependency during the demo.

Interactive docs: http://localhost:8000/docs

## Endpoints

| Endpoint | What it does |
| --- | --- |
| `GET /queue?job_id=j_001` | Ranked queue + flagged section for a posting. **This is what the dashboard renders.** |
| `POST /score/trust` | Combined Trust Score for one candidate, with sub-scores and gating status |
| `POST /score/fit?job_id=j_001` | Stage 3 alone: role fit, behavior, history |
| `GET /candidates/{id}/history` | Prior verification record across companies |
| `GET /jobs` | Postings and their rigor level |

## How the Fit Score is built

```
fit_score = 0.70 * role_fit + 0.30 * behavioral + history_modifier

role_fit    = 0.75 * requirement_match + 0.25 * seniority_match
behavioral  = 0.30 volume + 0.25 focus + 0.30 originality + 0.15 timing
```

**Requirement match is semantic, not keyword.** Each job requirement is embedded
and compared against every skill and experience claim the candidate has, in
vector space. "Built distributed message queues" matches "event-driven systems
at scale" with neither string sharing a word. Model is
`all-MiniLM-L6-v2` via sentence-transformers.

Experience summaries are split into individual sentences before matching. A
multi-sentence bullet embeds as an average of everything it mentions, which
buries the one sentence that actually answers the requirement. Splitting also
means the API can name the exact line that matched — `best_evidence` on every
`RequirementMatch`, which is a good thing to put on screen.

Raw cosine for this model runs 0.02–0.25 on unrelated text and 0.30–0.55 on
genuinely related text, and `embedding.py` maps that measured band onto 0–100.
**If you swap the model, re-measure the band** or every score shifts.

**Verified claims outrank unverified ones.** Evidence Stage 2 couldn't confirm
is discounted to 0.6 *before* the best match is chosen, so an unverified perfect
match can lose to a verified near-match. This is the thing that makes it a trust
score rather than a resume parser — worth saying out loud to judges.

**Behavioral check** catches the "200 identical AI-generated applications"
pattern using the same embedding model: mean pairwise similarity across the
candidate's applied job titles measures focus, and across their cover letters
measures originality. A real search is targeted and each letter is different;
a generated batch is neither.

**History modifier** is asymmetric on purpose: +2 per clean prior verification
(capped at +6), but −25 for any prior flag. Being vouched for elsewhere should
never outweigh having been caught elsewhere.

## How the Trust Score is built

```
trust_score = weighted(identity, consistency, fit), renormalized over
              whichever stages have actually produced a score
```

| Rigor | Identity | Consistency | Fit | Gate to human review |
| --- | --- | --- | --- | --- |
| `standard` | 0.45 | 0.35 | 0.20 | Stages 1–2 cleared |
| `strict` | 0.40 | 0.30 | 0.30 | All three cleared |

Gating rules, straight from the brief:

- Stage 1 below 70 → **fails**, Stages 2 and 3 never run, candidate moves to the
  flagged section. Still visible, just out of the ranked list.
- Stage 2 below 65 → doesn't unlock Stage 3, but the candidate **stays ranked**
  with their flags attached. Only Stage 1 failures leave the queue.
- Mid-pipeline candidates renormalize over completed stages, so they read as
  "in progress" instead of scoring low for work that hasn't happened yet.
- Nothing is ever deleted. It's a queue, not a filter.

The ranked list comes back in two bands: candidates who cleared every stage the
posting requires (`gates_cleared: true`) sorted by score, then everyone still in
progress or short of the bar, also sorted by score. Without the banding a
candidate who has only finished Stage 1 can outrank one who cleared all three,
on a fraction of the evidence.

## Integration contracts

Schemas live in [`app/models.py`](app/models.py) — that file is the handshake.

**From Teammate 1 (Identity)** and **Teammate 2 (Consistency)**, per candidate:

```json
{ "score": 94, "status": "cleared", "flags": ["..."] }
```

**From Teammate 2**, additionally, the verified profile — `skills[]` and
`experience[]` each carrying a `verified` boolean, which the fit scorer leans on
heavily. Also `applications_last_30d`, `application_history[]`, and
`burst_ratio` for the behavioral check.

**To Teammate 4 (Dashboard)**: `GET /queue?job_id=…` returns `ranked[]` and
`flagged[]`, each entry carrying `trust_score`, `sub_scores`, `stage_status`
per stage, `gates_cleared` for the band divider, and `flags[]` for the expanded
card. `POST /score/trust` additionally returns `fit_detail` with the
per-requirement match breakdown.

## Demo data

Seven mock candidates in [`app/data/candidates.json`](app/data/candidates.json),
built to span the story:

- **Priya Raman** — clears everything, previously verified clean at two other
  companies. Top of the queue.
- **Maya Chen** — strong verified match, focused search. Close second.
- **Marcus Webb** — clears all three stages and looks good on paper, but was
  flagged at Meridian Fintech for one voice print across two legal names. The
  −25 drops him. *Good one to expand on stage.*
- **Sam Okafor** — clears Stages 1 and 2, then 214 applications in 30 days with
  identical cover letters across backend / marketing / nursing / warehouse roles
  tank the behavioral score. *The "200 applications" case, caught by Stage 3.*
- **Jordan Blake** — clears identity, fails consistency (LinkedIn 3 days old,
  unverifiable title). Stays ranked, heavily flagged.
- **Dev Patel** — Stage 2 still running, shows as in progress.
- **Alex Rivera** — fails identity (face-swap artifacts on the reaction
  challenge). Flagged section, never reaches Stages 2 or 3.

Note that `j_001` is `strict` and `j_002` is `standard` — switching `job_id`
demonstrates the per-posting rigor toggle changing who reaches human review.
