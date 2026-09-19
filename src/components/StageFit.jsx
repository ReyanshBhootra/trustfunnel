const BARS = [
  { label: 'Distributed systems', pct: 94 },
  { label: 'Go or Rust in production', pct: 91 },
  { label: 'On-call / incident response', pct: 88 },
  { label: 'Identity, payments, or infra', pct: 80 },
];

export default function StageFit({ candidate, phase, revealed, onStart }) {
  const scanning = phase === 'scanning';
  const showBars = phase === 'revealing' || phase === 'done';

  return (
    <div className="flow-panel">
      <h3>Stage 3 — Fit</h3>
      <p className="lede">Weighted match against this posting, plus prior TrustFunnel history. Not keyword matching.</p>

      <div className="match-bars">
        {BARS.map((b) => (
          <div key={b.label} className="match-row">
            <div className="lab">
              <span>{b.label}</span>
              <span>{showBars ? `${b.pct}%` : '—'}</span>
            </div>
            <div className="bar">
              <span style={{ width: showBars ? `${b.pct}%` : '0%' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="history-lookup">
        {scanning && <div>lookup(candidate_id=MAYA-ELLISON) …</div>}
        {(phase === 'revealing' || phase === 'done') && (
          <>
            <div>lookup(candidate_id=MAYA-ELLISON)</div>
            <div style={{ color: '#6fae7c' }}>seen_before = true</div>
            <div>prior = Northstar Health, 2023 · verified · flags: none</div>
            <div>application_pattern = 3 targeted apps / 14 days</div>
          </>
        )}
        {phase === 'idle' && <div>prior_verification_history — not queried yet</div>}
      </div>

      <div className="checks-live">
        {scanning && <div className="scan-status">Scoring verified experience against this posting…</div>}
        {phase === 'done' && <div className="scan-status done">Fit scored · {candidate.fit.score}/100</div>}
        {candidate.fit.checks.map((chk, i) => {
          if (i >= revealed) return null;
          return (
            <div key={chk.label} className={`check ${chk.pass ? 'pass' : 'fail'}`}>
              <span className="mark">{chk.pass ? '✓' : '×'}</span>
              <div>
                {chk.label}
                <div className="note">{chk.note}</div>
              </div>
            </div>
          );
        })}
      </div>

      {phase === 'idle' && (
        <div className="actions">
          <button type="button" className="btn primary" onClick={onStart}>
            Run fit check
          </button>
        </div>
      )}
    </div>
  );
}
