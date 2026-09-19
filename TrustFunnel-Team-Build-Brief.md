# TrustFunnel: Team Build Brief

Hackathon: Trust in the Hiring Funnel (localhost:nyc x Integral Recruiting x NYU) Team size: 5 (you + 4 teammates) Tool sponsors to use: Block Convey (AI agent observability/tracing) and Solari (agent infrastructure, headless browsers, sandboxes)

## The One-Sentence Pitch

Three gated checkpoints (Identity, Consistency, Fit), one compounding trust score, and a ranked queue that tells a recruiter exactly who deserves a human's time first.

## How It Works: The Three Stages

Each stage gates the next. A candidate must clear Stage 1 before Stage 2 even runs. This matters for both the product logic and the demo: it means recruiters never waste time evaluating a fake person's resume quality.

### Stage 1: Identity Verification

Goal: prove this is a real, specific, live human, not a deepfake or a proxy.

- Baseline scan: one-time face + government ID scan at signup (selfie + ID photo), similar to fintech KYC onboarding. Creates a verified baseline face.
- Live reaction challenge: mid-interview, drop in one short, unscripted moment (react to an odd sentence, turn your head a certain way). Real-time deepfake face-swap tools break under spontaneous movement because they're trained on static photos. This is the FBI's own recommended manual test, automated.
- Voice consistency check: sample lip-sync drift and voice pitch a few times across the call, not just once. Cloned voices and cloned faces are usually generated separately and desync under stress.
- Cross-application pattern detection: flag when the same face, voice print, or writing style shows up across multiple applications under different names. Catches proxy interview rings and multi-job collectors.

Output: Identity Trust Score. Must clear a threshold to unlock Stage 2.

### Stage 2: Resume and Profile Consistency

Goal: confirm the application material is genuine and internally consistent, not fabricated or over-tailored.

- Resume provenance: track edit history (built over time vs. dropped in as one finished block) and typing rhythm (natural human hesitation vs. flat, uniform paste/bot timing).
- Title and claim verification: cross-check job titles, dates, and company names against what's publicly verifiable. Flag inflated or invented titles.
- LinkedIn import and cross-verification: candidate connects LinkedIn. System checks (a) resume matches LinkedIn history, no contradicting story, and (b) the LinkedIn account itself looks real: plausible connection/follower patterns, real posting history, account age, not a fresh account built to backstop a fake identity.
- Consistency scoring: flags contradictions across resume, cover letter, and LinkedIn as a set, not each checked in isolation.

Output: Consistency Score, layered onto Stage 1's score. Must clear a threshold to unlock Stage 3.

### Stage 3: Fit and History Verification

Goal: is this a good match, and have they been seen (and verified) before.

- Role fit scoring: weighted match between verified skills/experience (from Stage 2) and job requirements. Not keyword matching.
- Prior verification history: if this candidate has been through TrustFunnel at other companies, surface that: verified before, no flags, or previously flagged and why.
- Behavioral pattern check: does this candidate's application pattern (timing, targeting, writing style across jobs) look like a genuine focused search, or match the "200 identical AI-generated applications" fraud pattern.

Output: Fit Score. Combined with Stage 1 + Stage 2 into one final number.

## The Combined Score and Recruiter View

Trust Score = Identity (Stage 1) + Consistency (Stage 2) + Fit (Stage 3)

- Recruiter dashboard shows a ranked queue, highest combined score first.
- Each candidate card expands to show which stage they've cleared.
- Fail Stage 1 → never reaches Stage 2/3. Stays visible but flagged, doesn't clutter the ranked list.
- Partial completions show as "in progress," not excluded.
- Recruiter sets the bar per job posting. Low-risk/high-volume roles might only require Stage 1+2 to reach human review. Sensitive roles (system access, financial permissions, remote-only, the categories flagged in the North Korean IT worker fraud cases) require all three stages every time.
- Nothing gets silently deleted. It's a queue, not a filter. The system ranks; a human makes the final call.

## Team Split (4 people + you coordinating/pitching)

Copy your section below and paste it into Claude, ChatGPT, Cursor, or whatever AI tool you're building with. Each section is self-contained enough to start building from.

### Teammate 1: Identity Verification (Stage 1)

What to build: the live interview trust pipeline.

Paste this into your AI tool:

> Build a web-based video interview module that does the following: (1) captures a baseline face photo + ID photo at signup and stores a facial embedding, (2) during a live video call, compares the live face against the baseline embedding continuously, (3) triggers a "reaction challenge" at a random point mid-call, showing the candidate a short on-screen prompt (an odd sentence to react to, or "turn your head left") and scores whether the facial reaction looks natural/spontaneous vs. synthetic, (4) samples audio every ~30 seconds to check lip-sync alignment and voice pitch consistency, flagging any drift. Use MediaPipe or a similar face-mesh library for real-time facial landmark tracking. Output a single 0-100 Identity Trust Score with a breakdown of which sub-checks passed or failed. Build this as a standalone web component I can plug into a video call demo.

Tool sponsor to use: Solari, for the sandboxed browser/video environment to run this live without building call infrastructure from scratch.

### Teammate 2: Resume and Profile Consistency (Stage 2)

What to build: the browser extension + LinkedIn cross-check.

Paste this into your AI tool:

> Build a Chrome extension that runs while a candidate writes a resume or cover letter in a text field (Google Docs, a form, etc.). Track: (1) edit timestamps over the writing session, to detect whether the text was built incrementally vs. pasted in as one block, (2) keystroke timing (key hold duration, pauses between keys) to detect natural human typing rhythm vs. uniform bot/paste timing. Separately, build a simple LinkedIn data import flow: candidate exports/connects their LinkedIn profile, and the system cross-checks job titles, dates, and companies listed there against the resume for contradictions, and does a basic sanity check on the LinkedIn profile itself (account age, connection count, posting activity) to flag freshly created or thin profiles. Output a single 0-100 Consistency Score with a breakdown.

Tool sponsor to use: Block Convey, to trace and debug the scoring logic so you can show judges exactly which signal triggered which score.

### Teammate 3: Fit and History Verification (Stage 3) + Scoring Engine

What to build: role-fit matching, candidate history lookup, and the combined score calculator.

Paste this into your AI tool:

> Build a scoring service that takes (a) a job description and (b) a verified candidate profile (skills, experience, from Stage 2 output) and produces a weighted fit score, not simple keyword matching, but semantic similarity between the candidate's verified experience and the job requirements. Also build a simple lookup: if a candidate ID has been through this verification system before (mock this with a small database), surface their prior verification status (verified, flagged, and why). Finally, build the combined scoring function: Trust Score = Identity Score (from teammate 1) + Consistency Score (from teammate 2) + Fit Score (yours), each weighted, output as one 0-100 number plus the three sub-scores. Expose this as an API endpoint the dashboard (teammate 4) can call.

### Teammate 4: Recruiter Dashboard / ATS View + Demo Assembly

What to build: the ranked queue UI and the piece that ties the whole demo together.

Paste this into your AI tool:

> Build a recruiter-facing dashboard (a simple web app) that displays a ranked list of candidates sorted by combined Trust Score (highest first). Each row expands into a candidate card showing: which of the 3 stages they've cleared, sub-scores for Identity/Consistency/Fit, and any flags raised (e.g. "cross-application match detected" or "LinkedIn profile created 3 days ago"). Include a per-job-posting settings toggle so a recruiter can set the required rigor level (e.g. "Stage 1+2 sufficient" vs. "all 3 stages required") for that specific role. Candidates who fail Stage 1 should appear in a separate flagged section, not in the main ranked queue. This is the screen judges will see during the live demo, so prioritize it looking clean and readable over having every feature wired up.

Also responsible for: pulling everyone's output together into one working demo flow before presentation time, and coordinating with you (the pitcher) on what the live demo sequence looks like on stage.

## Demo Day Sequence (suggested)

1. Show a candidate going through Stage 1 live (the reaction challenge is your visual hook)
2. Show Stage 2 running in the background on a resume (the heatmap/provenance visual)
3. Show the recruiter dashboard with the ranked queue and one flagged candidate
4. Close with the pitch: this isn't one clever trick, it's a funnel a company sets policy on per job posting

## Key Stats to Have Ready for Judges

- 41% of organizations have hired a fraudulent candidate without knowing it (GetReal Security)
- Deepfake hiring fraud rose 1,300% in 2024 (Pindrop)
- Building a convincing deepfake candidate takes about 70 minutes with zero technical skill (HR Dive)
- Humans detect deepfakes with only 55.54% accuracy, barely better than a coin flip (2025 meta-analysis, 56 studies)
- Gartner projects 1 in 4 candidate profiles worldwide could be fake by 2028
