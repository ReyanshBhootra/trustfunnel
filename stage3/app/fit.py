"""Stage 3: role fit, behavioral pattern check, and the Fit Score.

Role fit is semantic, not keyword matching: each job requirement is compared
against the candidate's skills and experience in embedding space, so "built
distributed message queues" matches "event-driven systems at scale" without
either string containing the other.
"""

from __future__ import annotations

import re

import numpy as np

from . import embedding
from .models import (
    BehavioralBreakdown,
    CandidateProfile,
    FitBreakdown,
    HistoryLookup,
    JobPosting,
    RequirementMatch,
)

# Unverified claims still count -- Stage 2 couldn't confirm them, which is not
# the same as disproving them -- but they carry less weight than verified ones.
UNVERIFIED_DISCOUNT = 0.6

PREFERRED_WEIGHT = 0.5

ROLE_FIT_WEIGHTS = {"requirements": 0.75, "seniority": 0.25}
FIT_WEIGHTS = {"role_fit": 0.70, "behavioral": 0.30}

BEHAVIORAL_WEIGHTS = {
    "volume": 0.30,
    "focus": 0.25,
    "originality": 0.30,
    "timing": 0.15,
}


def _candidate_evidence(profile: CandidateProfile) -> list[tuple[str, bool]]:
    """Every claim the candidate makes, paired with whether Stage 2 verified it.

    Experience summaries are split into individual sentences. A multi-sentence
    bullet embeds as an average of everything it mentions, which buries the one
    sentence that actually answers a requirement -- matching sentence-by-sentence
    keeps that signal sharp and lets the API name the exact line as evidence.
    """
    evidence = [(s.name, s.verified) for s in profile.skills]

    for item in profile.experience:
        evidence.append((f"{item.title} at {item.company}", item.verified))
        for sentence in re.split(r"(?<=[.!?])\s+", item.summary):
            sentence = sentence.strip()
            if len(sentence) > 15:
                evidence.append((sentence, item.verified))

    return evidence


def score_requirements(
    job: JobPosting, profile: CandidateProfile
) -> tuple[float, list[RequirementMatch]]:
    """Weighted semantic match of the candidate against each job requirement."""
    evidence = _candidate_evidence(profile)
    if not job.requirements or not evidence:
        return 0.0, []

    texts = [text for text, _ in evidence]
    verified = np.array([1.0 if v else UNVERIFIED_DISCOUNT for _, v in evidence])

    matrix = embedding.similarity_matrix([r.text for r in job.requirements], texts)
    # Discount each piece of evidence by its verification status before picking
    # the best match, so an unverified perfect match can lose to a verified
    # near-match. That is the behavior we want from a trust product.
    discounted = matrix * verified

    matches: list[RequirementMatch] = []
    total_weight = 0.0
    weighted_sum = 0.0

    for row, requirement in zip(discounted, job.requirements):
        best = int(np.argmax(row))
        score = embedding.calibrate(float(row[best]))
        weight = requirement.weight * (
            PREFERRED_WEIGHT if requirement.kind == "preferred" else 1.0
        )

        weighted_sum += score * weight
        total_weight += weight
        matches.append(
            RequirementMatch(
                requirement=requirement.text,
                kind=requirement.kind,
                score=round(score, 1),
                best_evidence=texts[best],
                evidence_verified=evidence[best][1],
            )
        )

    return (weighted_sum / total_weight if total_weight else 0.0), matches


def score_seniority(job: JobPosting, profile: CandidateProfile) -> float:
    """How well verified years of experience line up with what the role needs."""
    if job.min_years <= 0:
        return 100.0

    verified_years = sum(e.years for e in profile.experience if e.verified)
    years = max(verified_years, profile.years_experience * UNVERIFIED_DISCOUNT)

    if years >= job.min_years:
        # Wildly overqualified is a mild fit signal, not a trust problem.
        overshoot = (years - job.min_years) / max(job.min_years, 1)
        return float(np.clip(100 - max(0.0, overshoot - 1.5) * 12, 70, 100))

    return float(np.clip(100 * (years / job.min_years), 0, 100))


def check_behavior(profile: CandidateProfile) -> BehavioralBreakdown:
    """Genuine focused job search, or 200 identical AI-generated applications?"""
    notes: list[str] = []

    # Volume: a real search is a couple dozen applications a month, not hundreds.
    excess = max(0, profile.applications_last_30d - 10)
    volume = float(np.clip(100 * np.exp(-excess / 40), 0, 100))
    if profile.applications_last_30d >= 100:
        notes.append(
            f"{profile.applications_last_30d} applications in 30 days "
            "-- consistent with automated mass application"
        )

    titles = [a.job_title for a in profile.application_history]
    letters = [
        a.cover_letter_excerpt for a in profile.application_history if a.cover_letter_excerpt
    ]

    # Focus: similar job titles across applications means a targeted search.
    # Scattered titles mean the candidate is spraying every posting they see.
    if len(titles) >= 2:
        focus = embedding.calibrate(embedding.mean_pairwise_similarity(titles))
        if focus < 35:
            notes.append("Applied roles span unrelated functions -- untargeted search")
    else:
        focus = 100.0

    # Originality: near-identical cover letters across applications are the
    # clearest tell of a generated batch.
    if len(letters) >= 2:
        sameness = embedding.mean_pairwise_similarity(letters)
        originality = float(np.clip((1 - sameness) * 140, 0, 100))
        if sameness > 0.75:
            notes.append(
                "Cover letters near-identical across applications "
                "-- single generated template"
            )
    else:
        originality = 100.0

    # Timing: humans apply in irregular bursts; bots fire at uniform intervals.
    timing = float(np.clip(100 * (1 - profile.burst_ratio), 0, 100))
    if profile.burst_ratio > 0.6:
        notes.append("Submission timing is machine-uniform rather than human-irregular")

    score = (
        volume * BEHAVIORAL_WEIGHTS["volume"]
        + focus * BEHAVIORAL_WEIGHTS["focus"]
        + originality * BEHAVIORAL_WEIGHTS["originality"]
        + timing * BEHAVIORAL_WEIGHTS["timing"]
    )

    return BehavioralBreakdown(
        score=round(score, 1),
        volume=round(volume, 1),
        focus=round(focus, 1),
        originality=round(originality, 1),
        timing=round(timing, 1),
        notes=notes,
    )


def score_fit(
    job: JobPosting, profile: CandidateProfile, history: HistoryLookup
) -> FitBreakdown:
    """Combine role fit, behavior, and prior verification into the Fit Score."""
    requirement_score, matches = score_requirements(job, profile)
    seniority = score_seniority(job, profile)

    role_fit = (
        requirement_score * ROLE_FIT_WEIGHTS["requirements"]
        + seniority * ROLE_FIT_WEIGHTS["seniority"]
    )

    behavioral = check_behavior(profile)

    fit_score = float(
        np.clip(
            role_fit * FIT_WEIGHTS["role_fit"]
            + behavioral.score * FIT_WEIGHTS["behavioral"]
            + history.modifier,
            0,
            100,
        )
    )

    flags = [*history.flags, *behavioral.notes]
    unverified = [m for m in matches if not m.evidence_verified and m.score >= 60]
    if unverified:
        flags.append(
            f"{len(unverified)} strong requirement match(es) rest on unverified claims"
        )

    return FitBreakdown(
        fit_score=round(fit_score, 1),
        role_fit=round(role_fit, 1),
        seniority_match=round(seniority, 1),
        requirement_matches=matches,
        behavioral=behavioral,
        history=history,
        flags=flags,
    )
