"""Integration contracts for the Stage 3 scoring service.

These schemas are the handshake with the rest of the team:

  Teammate 1 (Identity)    -> StageScore, posted as `identity`
  Teammate 2 (Consistency) -> StageScore + CandidateProfile
  Stage 3 (this service)   -> FitBreakdown
  Teammate 4 (Dashboard)   -> TrustScoreResponse / QueueEntry

Keep field names stable once teammates start wiring against them.
"""

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class StageStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    CLEARED = "cleared"
    FAILED = "failed"


class RigorLevel(str, Enum):
    """Set per job posting by the recruiter (Teammate 4's toggle)."""

    STANDARD = "standard"  # Stage 1 + 2 sufficient to reach human review
    STRICT = "strict"  # all three stages required every time


# --- Inputs from upstream stages -------------------------------------------


class StageScore(BaseModel):
    """A 0-100 score from Stage 1 or Stage 2, with whatever flags it raised."""

    score: float = Field(ge=0, le=100)
    status: StageStatus = StageStatus.CLEARED
    flags: list[str] = Field(default_factory=list)


class Skill(BaseModel):
    name: str
    # Verified by Stage 2 against LinkedIn / public record. Unverified skills
    # still count, but at a discount -- this is what makes the fit score a
    # *trust* signal and not just a resume parser.
    verified: bool = False
    years: float = 0.0


class ExperienceItem(BaseModel):
    title: str
    company: str
    summary: str
    years: float = 0.0
    verified: bool = False


class ApplicationRecord(BaseModel):
    """One prior application, used for the behavioral pattern check."""

    job_title: str
    applied_at: str  # ISO date
    cover_letter_excerpt: str = ""


class PriorVerification(BaseModel):
    """A previous trip through TrustFunnel at another company."""

    company: str
    date: str
    status: Literal["verified", "flagged"]
    reason: str = ""


class CandidateProfile(BaseModel):
    """Verified candidate profile -- Stage 2's output, Stage 3's input."""

    candidate_id: str
    name: str
    skills: list[Skill] = Field(default_factory=list)
    experience: list[ExperienceItem] = Field(default_factory=list)
    years_experience: float = 0.0
    applications_last_30d: int = 0
    application_history: list[ApplicationRecord] = Field(default_factory=list)
    # Fraction of applications submitted in tight automated-looking bursts.
    burst_ratio: float = Field(default=0.0, ge=0, le=1)


class Requirement(BaseModel):
    text: str
    weight: float = 1.0
    kind: Literal["required", "preferred"] = "required"


class JobPosting(BaseModel):
    job_id: str
    title: str
    requirements: list[Requirement] = Field(default_factory=list)
    min_years: float = 0.0
    rigor: RigorLevel = RigorLevel.STANDARD


# --- Stage 3 outputs --------------------------------------------------------


class RequirementMatch(BaseModel):
    requirement: str
    kind: str
    score: float
    best_evidence: str
    evidence_verified: bool


class BehavioralBreakdown(BaseModel):
    score: float
    volume: float
    focus: float
    originality: float
    timing: float
    notes: list[str] = Field(default_factory=list)


class HistoryLookup(BaseModel):
    candidate_id: str
    seen_before: bool
    prior_verifications: list[PriorVerification] = Field(default_factory=list)
    modifier: float = 0.0
    flags: list[str] = Field(default_factory=list)


class FitBreakdown(BaseModel):
    """Stage 3's output: the headline Fit Score plus every signal behind it."""

    fit_score: float
    role_fit: float
    seniority_match: float
    requirement_matches: list[RequirementMatch] = Field(default_factory=list)
    behavioral: BehavioralBreakdown
    history: HistoryLookup
    flags: list[str] = Field(default_factory=list)


# --- Combined scoring engine ------------------------------------------------


class TrustScoreRequest(BaseModel):
    job_id: str
    profile: CandidateProfile
    identity: StageScore | None = None
    consistency: StageScore | None = None


class StageSummary(BaseModel):
    identity: float | None = None
    consistency: float | None = None
    fit: float | None = None


class TrustScoreResponse(BaseModel):
    candidate_id: str
    name: str
    job_id: str
    trust_score: float
    sub_scores: StageSummary
    weights: dict[str, float]
    stage_status: dict[str, StageStatus]
    # Has this candidate cleared every stage this posting's rigor level requires?
    gates_cleared: bool
    reached_human_review: bool
    flagged: bool
    flags: list[str] = Field(default_factory=list)
    fit_detail: FitBreakdown | None = None


class QueueEntry(BaseModel):
    """One row in Teammate 4's ranked queue."""

    rank: int | None
    candidate_id: str
    name: str
    trust_score: float
    sub_scores: StageSummary
    stage_status: dict[str, StageStatus]
    gates_cleared: bool = False
    flagged: bool
    flags: list[str] = Field(default_factory=list)


class QueueResponse(BaseModel):
    job_id: str
    job_title: str
    rigor: RigorLevel
    ranked: list[QueueEntry]
    flagged: list[QueueEntry]
