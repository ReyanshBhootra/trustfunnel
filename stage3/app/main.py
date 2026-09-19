"""TrustFunnel Stage 3 API.

Serves the Fit Score, the prior-verification lookup, and the combined Trust
Score that Teammate 4's recruiter dashboard ranks candidates by.

    uvicorn stage3.app.main:app --reload --port 8000

Interactive docs at http://localhost:8000/docs -- usable as a demo surface if
the dashboard isn't wired up in time.
"""

from __future__ import annotations

import json
from contextlib import asynccontextmanager
from functools import lru_cache
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import embedding, fit, history, scoring
from .models import (
    CandidateProfile,
    FitBreakdown,
    HistoryLookup,
    JobPosting,
    QueueEntry,
    QueueResponse,
    StageScore,
    TrustScoreRequest,
    TrustScoreResponse,
)

DATA_DIR = Path(__file__).parent / "data"


@lru_cache(maxsize=1)
def _jobs() -> dict[str, JobPosting]:
    with open(DATA_DIR / "jobs.json") as handle:
        return {j["job_id"]: JobPosting(**j) for j in json.load(handle)}


@lru_cache(maxsize=1)
def _demo_candidates() -> list[dict]:
    """Mock applicant pool so /queue works without the other stages running."""
    with open(DATA_DIR / "candidates.json") as handle:
        return json.load(handle)


def _get_job(job_id: str) -> JobPosting:
    job = _jobs().get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Unknown job_id: {job_id}")
    return job


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Pay the model load cost at boot, not on the first request during the demo.
    embedding.warm_up()
    yield


app = FastAPI(
    title="TrustFunnel — Stage 3 Fit & Scoring Engine",
    description=(
        "Semantic role-fit scoring, prior-verification lookup, behavioral "
        "pattern detection, and the combined Trust Score."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

# The dashboard runs on a different port during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model": embedding.MODEL_NAME}


@app.get("/jobs", response_model=list[JobPosting])
def list_jobs() -> list[JobPosting]:
    """Job postings and the rigor level set on each."""
    return list(_jobs().values())


@app.get("/candidates/{candidate_id}/history", response_model=HistoryLookup)
def candidate_history(candidate_id: str) -> HistoryLookup:
    """Has this candidate been through TrustFunnel before, and how did it go?"""
    return history.lookup(candidate_id)


@app.post("/score/fit", response_model=FitBreakdown)
def score_fit(job_id: str, profile: CandidateProfile) -> FitBreakdown:
    """Stage 3 on its own: role fit, behavior, and prior-verification history."""
    return fit.score_fit(
        _get_job(job_id), profile, history.lookup(profile.candidate_id)
    )


@app.post("/score/trust", response_model=TrustScoreResponse)
def score_trust(request: TrustScoreRequest) -> TrustScoreResponse:
    """The combined engine: Identity + Consistency + Fit into one 0-100 score."""
    return scoring.score_candidate(
        _get_job(request.job_id),
        request.profile,
        request.identity,
        request.consistency,
    )


@app.get("/queue", response_model=QueueResponse)
def queue(job_id: str) -> QueueResponse:
    """The ranked queue for a posting, plus the flagged candidates beside it.

    Scores the full mock applicant pool against one job. This is the endpoint
    the recruiter dashboard renders.
    """
    job = _get_job(job_id)

    ranked: list[QueueEntry] = []
    flagged: list[QueueEntry] = []

    for record in _demo_candidates():
        result = scoring.score_candidate(
            job,
            CandidateProfile(**record["profile"]),
            StageScore(**record["identity"]) if record.get("identity") else None,
            StageScore(**record["consistency"]) if record.get("consistency") else None,
        )
        entry = QueueEntry(
            rank=None,
            candidate_id=result.candidate_id,
            name=result.name,
            trust_score=result.trust_score,
            sub_scores=result.sub_scores,
            stage_status=result.stage_status,
            gates_cleared=result.gates_cleared,
            flagged=result.flagged,
            flags=result.flags,
        )
        # Nothing is deleted: failing Stage 1 moves a candidate out of the
        # ranked list, it doesn't remove them from the screen.
        (flagged if result.flagged else ranked).append(entry)

    # Candidates who cleared every stage this posting requires come first,
    # ordered by score; everyone still in progress or short of the bar follows,
    # also ordered by score. Without this a candidate who has only finished
    # Stage 1 can outrank one who cleared all three on partial evidence.
    ranked.sort(key=lambda e: (e.gates_cleared, e.trust_score), reverse=True)
    for position, entry in enumerate(ranked, start=1):
        entry.rank = position

    return QueueResponse(
        job_id=job.job_id,
        job_title=job.title,
        rigor=job.rigor,
        ranked=ranked,
        flagged=flagged,
    )
