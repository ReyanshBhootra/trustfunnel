# TrustFunnel

Hackathon project: *Trust in the Hiring Funnel* (localhost:nyc x Integral
Recruiting x NYU). Three gated checkpoints — Identity, Consistency, Fit — one
compounding trust score, and a ranked queue that tells a recruiter who deserves
a human's time first.

## Team build, four stages, four people

This is a **five-person team build**, not a solo project. Each teammate owns one
stage and works on their own branch. The full split, including the per-stage
build prompts, is in [`TrustFunnel-Team-Build-Brief.md`](TrustFunnel-Team-Build-Brief.md)
— that file is the source of truth for what each stage is supposed to check.

| Stage | Owner | Branch |
| --- | --- | --- |
| 1 — Identity verification (live video, deepfake detection) | Teammate 1 | — |
| 2 — Resume & profile consistency (extension, LinkedIn cross-check) | Teammate 2 | — |
| 3 — Fit & history + scoring engine | **this branch** | `Stage-3-Fit` |
| 4 — Recruiter dashboard + demo assembly | Teammate 4 | — |

## What's in this branch

`Stage-3-Fit` contains **Stage 3 only**, in [`stage3/`](stage3/): semantic
role-fit scoring, prior-verification lookup, behavioral pattern detection, and
the combined Trust Score API that Teammate 4's dashboard calls.

Read [`stage3/README.md`](stage3/README.md) before changing anything in there —
it documents the scoring formulas, the gating rules, and the integration
contracts with the other three stages.

Do not build Stage 1, 2, or 4 work into this branch. If something here needs a
change on another stage's side, that's a contract change in
`stage3/app/models.py` and it needs to be communicated to that teammate, not
worked around locally.

## Stack

Python 3.11 + FastAPI. Semantic matching runs locally via sentence-transformers
(`all-MiniLM-L6-v2`) — deliberately no API key and no network dependency, so
nothing on stage rides on conference wifi.

```bash
.venv/bin/uvicorn stage3.app.main:app --reload --port 8000
```

## Priorities

It's a hackathon demo, judged live in under five minutes. Prefer decisions that
hold up when a judge probes them — the semantic matching is genuinely semantic,
and the behavioral check genuinely runs on the data — over breadth of features.
Mock data is fine and expected; fake scoring logic is not, because the one thing
a judge will poke at is whether the score means anything.
