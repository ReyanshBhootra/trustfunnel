"""Local sentence-embedding model behind the semantic matching.

Runs entirely on-device (no API key, no network at demo time) so nothing on
stage depends on conference wifi. First load pulls ~80MB of model weights and
caches them under ~/.cache/huggingface.
"""

from __future__ import annotations

import threading

import numpy as np

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Measured band for this model on job-requirement vs resume-evidence text:
# unrelated pairs land 0.02-0.25, genuinely related ones 0.30-0.55. Map that
# band onto 0-100 so scores read the way a recruiter expects rather than
# bunching everything into the middle. Re-measure if you swap the model.
_SIM_FLOOR = 0.22
_SIM_CEIL = 0.55

_model = None
_lock = threading.Lock()
_cache: dict[str, np.ndarray] = {}


def get_model():
    """Load the model once, lazily, and thread-safely."""
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                from sentence_transformers import SentenceTransformer

                _model = SentenceTransformer(MODEL_NAME)
    return _model


def encode(texts: list[str]) -> np.ndarray:
    """Embed texts to L2-normalized vectors, caching by exact string.

    Job requirements get embedded on every request, so the cache keeps the
    repeated work off the hot path.
    """
    if not texts:
        return np.zeros((0, 384), dtype=np.float32)

    missing = [t for t in dict.fromkeys(texts) if t not in _cache]
    if missing:
        vectors = get_model().encode(
            missing, normalize_embeddings=True, show_progress_bar=False
        )
        for text, vector in zip(missing, vectors):
            _cache[text] = np.asarray(vector, dtype=np.float32)

    return np.vstack([_cache[t] for t in texts])


def similarity_matrix(left: list[str], right: list[str]) -> np.ndarray:
    """Cosine similarity of every left text against every right text."""
    if not left or not right:
        return np.zeros((len(left), len(right)), dtype=np.float32)
    return encode(left) @ encode(right).T


def calibrate(similarity: float) -> float:
    """Map a raw cosine similarity onto a 0-100 score."""
    scaled = (similarity - _SIM_FLOOR) / (_SIM_CEIL - _SIM_FLOOR)
    return float(np.clip(scaled, 0.0, 1.0) * 100)


def mean_pairwise_similarity(texts: list[str]) -> float:
    """Average cosine similarity between every distinct pair of texts.

    High means the texts say the same thing -- a focused job search when
    applied to job titles, a copy-pasted template when applied to cover
    letters.
    """
    if len(texts) < 2:
        return 0.0
    matrix = similarity_matrix(texts, texts)
    upper = matrix[np.triu_indices(len(texts), k=1)]
    return float(upper.mean())


def warm_up() -> None:
    """Force the model load so the first real request isn't the slow one."""
    encode(["warm up"])
