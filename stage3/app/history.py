"""Prior verification lookup.

If a candidate has been through TrustFunnel at another company, surface what
happened: cleanly verified, or flagged and why. Backed by a small JSON file
standing in for the cross-company verification registry.
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from .models import HistoryLookup, PriorVerification

DATA_DIR = Path(__file__).parent / "data"

# A clean prior verification is mild corroboration; a prior flag is a loud
# signal. The asymmetry is deliberate -- being vouched for elsewhere should
# never outweigh having been caught elsewhere.
CLEAN_BONUS_PER_RECORD = 2.0
MAX_CLEAN_BONUS = 6.0
FLAGGED_PENALTY = 25.0


@lru_cache(maxsize=1)
def _registry() -> dict[str, list[dict]]:
    with open(DATA_DIR / "verification_history.json") as handle:
        return json.load(handle)


def lookup(candidate_id: str) -> HistoryLookup:
    records = [PriorVerification(**r) for r in _registry().get(candidate_id, [])]

    if not records:
        return HistoryLookup(candidate_id=candidate_id, seen_before=False)

    flagged = [r for r in records if r.status == "flagged"]
    clean = [r for r in records if r.status == "verified"]

    modifier = min(len(clean) * CLEAN_BONUS_PER_RECORD, MAX_CLEAN_BONUS)
    flags: list[str] = []

    if flagged:
        modifier -= FLAGGED_PENALTY
        for record in flagged:
            flags.append(f"Previously flagged at {record.company}: {record.reason}")
    elif clean:
        companies = ", ".join(r.company for r in clean)
        flags.append(f"Previously verified with no flags at {companies}")

    return HistoryLookup(
        candidate_id=candidate_id,
        seen_before=True,
        prior_verifications=records,
        modifier=round(modifier, 1),
        flags=flags,
    )
