# TrustFunnel — Hackathon Demo Prototype

## What this is
A single-page React app (no backend) that simulates an AI-powered hiring trust
pipeline. This is a **demo prototype for judges**, not a working product.
Everything is mocked, scripted, and timed for visual impact — nothing here
needs to actually detect deepfakes or call LinkedIn's API. It needs to *look*
real and tell a clear story in under 5 minutes on stage.

Built solo in a ~3 hour window. Optimize every decision for "does this look
convincing on a projector" over "is this technically correct."

## Reference doc
The original team brief (`TrustFunnel Team Build Brief`) breaks this same
project into 4 teammate-sized chunks (Identity, Consistency, Fit+Scoring,
Dashboard) with a separate AI-tool prompt for each. Keep that doc on hand
for the underlying logic/detail behind each stage — this CLAUDE.md
collapses all 4 into one solo, fully-mocked build, so use the team brief as
the reference for *what a stage is supposed to check*, not for how to
architect or split the code.

## The pitch (say this out loud, it's the north star)
Three gated checkpoints (Identity, Consistency, Fit), one compounding trust
score, and a ranked queue that tells a recruiter exactly who deserves a
human's time first.

## Scope: what we are building
ONE React app with two views the presenter clicks between:

1. **Candidate Flow view** — a scripted walkthrough of a candidate going
   through Stage 1 → Stage 2 → Stage 3, with fake "AI is analyzing..."
   moments and a score building up live.
2. **Recruiter Dashboard view** — a ranked queue of ~5-6 pre-loaded mock
   candidates, sorted by Trust Score, with one candidate visibly flagged
   and excluded from the main list.

No real video capture, no real face tracking, no real LinkedIn OAuth, no
real backend/API calls. Every "check" is a timed fake animation followed by
a pre-scripted result. See "Mocking strategy" below — this is the most
important section.

## Non-goals (do not spend time on these)
- Real facial recognition, face-mesh, or MediaPipe integration
- Real audio/lip-sync analysis
- Real LinkedIn API/OAuth
- Any backend, database, or persisted state (in-memory/mock data only)
- Auth, accounts, multi-user anything
- Mobile responsiveness (demo runs on a laptop, projector)
- Error handling beyond "don't crash during the live demo"

## Tech stack
- Single-page React app, no backend
- Plain CSS or Tailwind (whichever is faster to make look polished)
- `setTimeout`/state machine to fake "processing" delays — no real ML calls
- All candidate/job data lives in a local JS/JSON mock data file

## Mocking strategy (the core of this build)
Every "AI check" is really: show a loading/scanning animation for 1.5–3
seconds → reveal a pre-determined pass/fail result with a score. Structure
this as a simple state machine per stage so it's easy to demo reliably and
re-run if something goes wrong live.

- **Stage 1 (Identity)**: fake webcam preview (can use a static image or the
  user's real webcam feed via `getUserMedia` purely for visual effect — no
  processing of it), a "reaction challenge" prompt appears on screen
  ("Say the word 'purple' out loud"), then after a delay, show sub-checks
  ticking off one by one (Baseline match ✅, Reaction naturalness ✅, Voice
  consistency ✅, Cross-application scan ✅) ending in an Identity Score
  (e.g. 94/100).
- **Stage 2 (Consistency)**: show a mock "resume heatmap" (color-coded
  paragraph blocks — green = built incrementally, red = pasted in one block)
  and a fake LinkedIn cross-check card with a few bullet results. End in a
  Consistency Score.
- **Stage 3 (Fit)**: show a simple % match bar against a job description,
  plus a "prior verification history" lookup (mock: "Seen before — no
  flags" for most, one candidate shows "Seen before — previously flagged").
  End in a Fit Score.
- **Combined score**: sum/weight the three mock scores live on screen so the
  number visibly builds as each stage clears.
- **The one flagged candidate** in the dashboard should fail Stage 1 (never
  reaches Stage 2/3) so the "fail Stage 1 → flagged, not ranked" logic is
  visually obvious.

Keep all mock scores/results in one editable data file so they're easy to
tweak between now and demo time without touching component logic.

## Screens / components needed
1. `CandidateFlow` — orchestrates Stage 1 → 2 → 3 as a guided sequence with
   a "Next" control the presenter can click to advance (don't rely on
   timers alone during a live demo — presenter needs control).
2. `StageIdentity`, `StageConsistency`, `StageFit` — one component per
   stage, each showing its scanning animation + sub-check reveals + score.
3. `ScoreBuildup` — small persistent widget showing the combined score
   accumulating across stages.
4. `RecruiterDashboard` — ranked list of mock candidates sorted by combined
   score, each row expandable to show stage-by-stage breakdown and flags.
5. `FlaggedSection` — visually separate area for candidates who failed
   Stage 1.
6. `JobRigorToggle` — a per-job-posting toggle ("Stage 1+2 sufficient" vs
   "All 3 required") on the dashboard — can be non-functional/decorative if
   time runs short, just needs to be visible.

## Mock data needed
- 5-6 candidates with names, combined scores, per-stage scores, and flags
  (e.g. one with "Cross-application match detected", one with "LinkedIn
  profile created 3 days ago")
- 1 job description for the Fit stage to match against
- Sub-check pass/fail lists per stage (see Mocking strategy above)

## Priority order if time runs short
1. Recruiter Dashboard with ranked queue + one flagged candidate (this is
   the payoff screen — judges need to see this even if nothing else works)
2. Stage 1 candidate flow with the reaction-challenge visual hook
3. Combined score buildup animation
4. Stage 2 and Stage 3 visuals
5. Job rigor toggle (nice-to-have, can be static)

## Demo day sequence (for reference, not to build UI around too rigidly)
1. Candidate goes through Stage 1 live — reaction challenge is the visual hook
2. Stage 2 runs (resume heatmap visual)
3. Cut to recruiter dashboard — ranked queue + one flagged candidate
4. Close: "this isn't one clever trick, it's a funnel a company sets policy
   on per job posting"

## Stats to surface somewhere in the UI (footer, intro card, or slide-in)
- 41% of organizations have hired a fraudulent candidate without knowing it
  (GetReal Security)
- Deepfake hiring fraud rose 1,300% in 2024 (Pindrop)
- A convincing deepfake candidate takes ~70 minutes to build with zero
  technical skill (HR Dive)
- Humans detect deepfakes with only 55.54% accuracy (2025 meta-analysis, 56
  studies)
- Gartner projects 1 in 4 candidate profiles worldwide could be fake by 2028

## Tone/visual direction
Should feel like a real B2B recruiting SaaS tool (think: clean dashboard,
confident data viz, not a toy). Judges see a LOT of "AI wrapper" demos in 3
hours — polish on the Recruiter Dashboard specifically is what will make
this read as a real product idea rather than a hackathon sketch.
