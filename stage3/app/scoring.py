"""The combined scoring engine.

Trust Score = weighted(Identity, Consistency, Fit), with the gating rules from
the brief applied: each stage unlocks the next, a Stage 1 failure means Stages
2 and 3 never run, and nothing is ever dropped -- it is a queue, not a filter.
"""

from __future__ import annotations

from . import fit as fit_module
from . import history as history_module
from .models import (
    CandidateProfile,
    JobPosting,
    RigorLevel,
    StageScore,
    StageStatus,
    StageSummary,
    TrustScoreResponse,
)

# A stage must clear its threshold before the next one runs.
IDENTITY_THRESHOLD = 70.0
CONSISTENCY_THRESHOLD = 65.0

# Identity carries the most weight everywhere: a great resume from a person who
# isn't real is worth nothing. Under STRICT the Fit stage earns real weight
# because the role demands all three checks.
WEIGHTS = {
    RigorLevel.STANDARD: {"identity": 0.45, "consistency": 0.35, "fit": 0.20},
    RigorLevel.STRICT: {"identity": 0.40, "consistency": 0.30, "fit": 0.30},
}

# Score below this and a human shouldn't be spending time here yet.
HUMAN_REVIEW_THRESHOLD = 65.0


def _stage_status(score: StageScore | None, threshold: float) -> StageStatus:
    if score is None:
        return StageStatus.NOT_STARTED
    if score.status in (StageStatus.IN_PROGRESS, StageStatus.NOT_STARTED):
        return score.status
    return StageStatus.CLEARED if score.score >= threshold else StageStatus.FAILED


def score_candidate(
    job: JobPosting,
    profile: CandidateProfile,
    identity: StageScore | None,
    consistency: StageScore | None,
) -> TrustScoreResponse:
    identity_status = _stage_status(identity, IDENTITY_THRESHOLD)
    flags = list(identity.flags) if identity else []

    # Stage 1 gates everything. A failed identity check stops the pipeline.
    if identity_status == StageStatus.FAILED:
        return TrustScoreResponse(
            candidate_id=profile.candidate_id,
            name=profile.name,
            job_id=job.job_id,
            trust_score=round(identity.score * WEIGHTS[job.rigor]["identity"], 1),
            sub_scores=StageSummary(identity=identity.score),
            weights=WEIGHTS[job.rigor],
            stage_status={
                "identity": StageStatus.FAILED,
                "consistency": StageStatus.NOT_STARTED,
                "fit": StageStatus.NOT_STARTED,
            },
            gates_cleared=False,
            reached_human_review=False,
            flagged=True,
            flags=flags or ["Failed identity verification"],
        )

    consistency_status = (
        _stage_status(consistency, CONSISTENCY_THRESHOLD)
        if identity_status == StageStatus.CLEARED
        else StageStatus.NOT_STARTED
    )
    if consistency:
        flags.extend(consistency.flags)

    # Stage 3 only runs once Stages 1 and 2 have both cleared.
    fit_detail = None
    fit_status = StageStatus.NOT_STARTED
    if consistency_status == StageStatus.CLEARED:
        fit_detail = fit_module.score_fit(
            job, profile, history_module.lookup(profile.candidate_id)
        )
        fit_status = StageStatus.CLEARED
        flags.extend(fit_detail.flags)

    weights = WEIGHTS[job.rigor]
    statuses = {
        "identity": identity_status,
        "consistency": consistency_status,
        "fit": fit_status,
    }
    sub_scores = StageSummary(
        identity=identity.score if identity else None,
        consistency=consistency.score if consistency else None,
        fit=fit_detail.fit_score if fit_detail else None,
    )

    # Renormalize over the stages that have actually settled. A stage still
    # running has no verdict yet, so folding its placeholder score in would
    # punish a candidate for work that hasn't finished -- they read as "in
    # progress" via stage_status instead.
    settled = {StageStatus.CLEARED, StageStatus.FAILED}
    present = {
        "identity": sub_scores.identity,
        "consistency": sub_scores.consistency,
        "fit": sub_scores.fit,
    }
    live = {
        k: v for k, v in present.items() if v is not None and statuses[k] in settled
    }
    total_weight = sum(weights[k] for k in live) or 1.0
    trust_score = sum(weights[k] * v for k, v in live.items()) / total_weight

    # STRICT postings require all three stages before a human looks; STANDARD
    # lets a candidate through on Stages 1 and 2 alone.
    required = ["identity", "consistency"]
    if job.rigor == RigorLevel.STRICT:
        required.append("fit")
    gates_cleared = all(statuses[stage] == StageStatus.CLEARED for stage in required)

    return TrustScoreResponse(
        candidate_id=profile.candidate_id,
        name=profile.name,
        job_id=job.job_id,
        trust_score=round(trust_score, 1),
        sub_scores=sub_scores,
        weights=weights,
        stage_status=statuses,
        gates_cleared=gates_cleared,
        reached_human_review=gates_cleared and trust_score >= HUMAN_REVIEW_THRESHOLD,
        # Only a Stage 1 failure pulls a candidate out of the ranked queue into
        # the flagged section. A weak Stage 2 stays ranked, just low and noisy.
        flagged=identity_status == StageStatus.FAILED,
        flags=flags,
        fit_detail=fit_detail,
    )
