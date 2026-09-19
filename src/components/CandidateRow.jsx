import { displayScore, stageState } from '../data/mock.js';

const STAGE_PILLS = [
  { key: 'identity', label: 'S1 Identity' },
  { key: 'consistency', label: 'S2 Consistency' },
  { key: 'fit', label: 'S3 Fit' },
];

function StageColumns({ candidate }) {
  return STAGE_PILLS.map(({ key, label }) => {
    const stage = candidate[key];
    const state = stageState(candidate, key);
    const locked = state === 'pending' && !candidate.identity.cleared && key !== 'identity';
    return (
      <div key={key} className={`stage-col ${state === 'pending' ? 'dim' : ''}`}>
        <div className="k">{label.toUpperCase()}</div>
        <div className="scoreline">
          <span className={`s ${state}`}>
            {stage.score == null ? '—' : stage.score}
          </span>
          <span className="chip">{state === 'cleared' ? 'cleared' : state === 'failed' ? 'failed' : 'not run'}</span>
        </div>
        {locked ? (
          <p className="locked-note">Locked. Identity gate was not cleared.</p>
        ) : stage.checks.length === 0 ? (
          <p className="locked-note">Waiting on this stage. Partial completions stay in the funnel as in progress.</p>
        ) : (
          stage.checks.map((chk) => (
            <div key={chk.label} className={`check ${chk.pass ? 'pass' : 'fail'}`}>
              <span className="mark">{chk.pass ? '✓' : '×'}</span>
              <div>
                {chk.label}
                <div className="note">{chk.note}</div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  });
}

export default function CandidateRow({ candidate, rank, open, onToggle, variant, highlight }) {
  const flagged = variant === 'flagged';
  const score = flagged ? candidate.identity.score : displayScore(candidate);
  const criticalFlag = candidate.flags.find((f) => f.severity === 'critical');
  const warnFlag = candidate.flags.find((f) => f.severity === 'warn');

  return (
    <article className={`row ${flagged ? 'flagged' : variant === 'in_progress' ? 'in-progress' : 'ready'} ${open ? 'open' : ''} ${highlight ? 'pulse' : ''}`}>
      <button type="button" className="row-main" onClick={onToggle} aria-expanded={open}>
        <div className="rank">{rank ?? '—'}</div>
        <div className="avatar-lg" style={{ background: candidate.accent }}>
          {candidate.initials}
        </div>
        <div className="who">
          <div className="name">
            {candidate.name}
            {candidate.liveDemo && <span className="chip gold">LIVE DEMO</span>}
            {criticalFlag && <span className="chip crit">{criticalFlag.label}</span>}
            {!criticalFlag && warnFlag && <span className="chip warn">{warnFlag.label}</span>}
          </div>
          <div className="meta">
            {candidate.currentTitle} · {candidate.location} · {candidate.appliedAt}
          </div>
        </div>
        <div className="stage-pills">
          {STAGE_PILLS.map(({ key, label }) => (
            <span key={key} className={`pill ${stageState(candidate, key)}`}>
              {label}
            </span>
          ))}
        </div>
        <div className="score-block">
          <div className={`num ${score == null ? 'muted' : ''}`}>{score ?? '—'}</div>
          <div className="cap">{flagged ? 'IDENTITY' : 'TRUST'}</div>
        </div>
        <div className="chevron">▾</div>
      </button>

      <div className="row-detail">
        <div className="row-detail-inner">
          <div className="detail-grid">
            <StageColumns candidate={candidate} />
            <div className="flag-col">
              <h4>FLAGS & HISTORY</h4>
              {candidate.flags.length === 0 && (
                <div className="flag">
                  <div className="fl">No flags</div>
                  <p>All sub-checks cleared. Safe to spend a human's time.</p>
                </div>
              )}
              {candidate.flags.map((f) => (
                <div key={f.label} className={`flag ${f.severity === 'critical' ? 'critical' : 'warn'}`}>
                  <div className="fl">{f.label}</div>
                  <p>{f.detail}</p>
                </div>
              ))}
              <div className="history">
                <strong>{candidate.priorHistory.label}</strong>
                {candidate.priorHistory.detail}
              </div>
              <div className="cta-row">
                {flagged ? (
                  <button type="button" className="btn">Keep held</button>
                ) : (
                  <button type="button" className="btn primary">Advance to human interview</button>
                )}
                <button type="button" className="btn ghost">
                  {flagged ? 'Request new live session' : 'Hold for later'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
