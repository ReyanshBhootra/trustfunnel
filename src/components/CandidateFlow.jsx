import { useEffect, useRef, useState } from 'react';
import { CANDIDATES, LIVE_CANDIDATE_ID } from '../data/mock.js';
import ScoreBuildup from './ScoreBuildup.jsx';
import StageIdentity from './StageIdentity.jsx';
import StageConsistency from './StageConsistency.jsx';
import StageFit from './StageFit.jsx';

const STAGES = ['identity', 'consistency', 'fit'];

export default function CandidateFlow({ onShowInQueue }) {
  const candidate = CANDIDATES['swe-platform'].find((c) => c.id === LIVE_CANDIDATE_ID);
  const [stageIdx, setStageIdx] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | scanning | revealing | done
  const [revealed, setRevealed] = useState(0);
  const [scores, setScores] = useState({ identity: null, consistency: null, fit: null });
  const timers = useRef([]);

  function clearTimers() {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }

  useEffect(() => () => clearTimers(), []);

  const stageKey = STAGES[stageIdx];
  const stageData = candidate[stageKey];

  function runStage() {
    clearTimers();
    setPhase('scanning');
    setRevealed(0);

    const scanMs = 1800;
    const perCheck = 420;
    const checks = stageData.checks.length;

    timers.current.push(
      setTimeout(() => {
        setPhase('revealing');
        for (let i = 0; i < checks; i += 1) {
          timers.current.push(
            setTimeout(() => setRevealed(i + 1), perCheck * (i + 1))
          );
        }
        timers.current.push(
          setTimeout(() => {
            setScores((s) => ({ ...s, [stageKey]: stageData.score }));
            setPhase('done');
          }, perCheck * checks + 200)
        );
      }, scanMs)
    );
  }

  function next() {
    clearTimers();
    if (stageIdx < STAGES.length - 1) {
      setStageIdx(stageIdx + 1);
      setPhase('idle');
      setRevealed(0);
    }
  }

  function reset() {
    clearTimers();
    setStageIdx(0);
    setPhase('idle');
    setRevealed(0);
    setScores({ identity: null, consistency: null, fit: null });
  }

  const StageView = [StageIdentity, StageConsistency, StageFit][stageIdx];
  const allDone = scores.fit != null;

  return (
    <div className="flow">
      <div className="flow-main">
        <div className="stage-rail">
          {STAGES.map((k, i) => (
            <div
              key={k}
              className={`dot ${i < stageIdx || (i === stageIdx && phase === 'done') ? 'done' : ''} ${
                i === stageIdx && phase !== 'done' ? 'active' : ''
              }`}
            />
          ))}
        </div>
        <div className="stage-labels">
          <span className={stageIdx === 0 ? 'current' : ''}>1 Identity</span>
          <span className={stageIdx === 1 ? 'current' : ''}>2 Consistency</span>
          <span className={stageIdx === 2 ? 'current' : ''}>3 Fit</span>
        </div>

        <p className="lede" style={{ marginBottom: 16, color: 'var(--text-dim)' }}>
          Live candidate: <strong style={{ color: 'var(--text)' }}>{candidate.name}</strong> · {candidate.currentTitle} · applying to Senior Software Engineer
        </p>

        <StageView
          candidate={candidate}
          phase={phase}
          revealed={revealed}
          onStart={runStage}
        />

        <div className="actions">
          {phase === 'done' && stageIdx < 2 && (
            <button type="button" className="btn primary" onClick={next}>
              Continue to Stage {stageIdx + 2}
            </button>
          )}
          {allDone && (
            <button type="button" className="btn primary" onClick={() => onShowInQueue(candidate.id)}>
              Open in recruiter queue
            </button>
          )}
          <button type="button" className="btn" onClick={reset}>
            Reset walkthrough
          </button>
        </div>
      </div>

      <aside className="flow-side">
        <ScoreBuildup scores={scores} />
        <p className="side-note">
          Each stage gates the next. A recruiter never spends time on resume quality for someone who failed identity.
          Presenter controls every step — nothing auto-advances between stages.
        </p>
        <a className="live-link" href="/identity.html" target="_blank" rel="noreferrer">
          Open live camera module ↗
        </a>
        <a className="live-link" href="/stage2/index.html" target="_blank" rel="noreferrer">
          Open live consistency check ↗
        </a>
        <a className="live-link" href="/stage3/index.html" target="_blank" rel="noreferrer">
          Open live fit &amp; scoring engine ↗
        </a>
      </aside>
    </div>
  );
}
