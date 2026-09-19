export default function ScoreBuildup({ scores }) {
  const parts = [scores.identity, scores.consistency, scores.fit].filter((n) => typeof n === 'number');
  const total = parts.length ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : null;

  const rows = [
    { k: 'Identity', v: scores.identity },
    { k: 'Consistency', v: scores.consistency },
    { k: 'Fit', v: scores.fit },
  ];

  return (
    <div className="score-buildup flow-panel">
      <h3>COMBINED TRUST SCORE</h3>
      <div className={`build-total ${total == null ? 'unset' : ''}`}>{total ?? '—'}</div>
      <div className="build-cap">{parts.length}/3 stages in · equal weight</div>
      {rows.map((r) => (
        <div key={r.k} className="build-row">
          <span>{r.k}</span>
          <span className={`v ${r.v == null ? 'off' : ''}`}>{r.v ?? '—'}</span>
        </div>
      ))}
    </div>
  );
}
