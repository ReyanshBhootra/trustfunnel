const HEAT = [
  {
    c: '#1e3a28',
    border: '#6fae7c',
    label: 'Summary · 2 sessions',
    text: 'Staff engineer focused on multi-tenant pipeline reliability. Led the migration of Lattice’s auth edge to Go, cutting p99 by 40%.',
  },
  {
    c: '#1e3a28',
    border: '#6fae7c',
    label: 'Lattice · 2021–present · incremental',
    text: 'Owned identity-adjacent services, on-call for platform, designed the internal feature-flag bus used by 12 teams.',
  },
  {
    c: '#1e3a28',
    border: '#6fae7c',
    label: 'Prior roles · built over 4 days',
    text: 'Backend engineer at Northstar Health (2018–2021). Distributed job scheduler, HIPAA audit trail, paging rotations.',
  },
  {
    c: '#3a2e18',
    border: '#d4a054',
    label: 'Skills · short pause, then paste',
    text: 'Go, Rust, Postgres, Kafka, Terraform, Kubernetes, Datadog, incident command.',
  },
  {
    c: '#1e3a28',
    border: '#6fae7c',
    label: 'Education · typed live',
    text: 'B.S. Computer Science, NYU Tandon, 2018.',
  },
];

export default function StageConsistency({ candidate, phase, revealed, onStart }) {
  const scanning = phase === 'scanning';

  return (
    <div className="flow-panel">
      <h3>Stage 2 — Consistency</h3>
      <p className="lede">Confirm the application was built by a person, and that resume and LinkedIn tell one story.</p>

      <div className="heat-legend">
        <span><i style={{ background: '#6fae7c' }} /> Built incrementally</span>
        <span><i style={{ background: '#d4a054' }} /> Mixed</span>
        <span><i style={{ background: '#d9694f' }} /> Pasted as one block</span>
      </div>
      <div className="heatmap">
        {HEAT.map((b) => (
          <div
            key={b.label}
            className="heat-para"
            style={{
              background: b.c,
              borderColor: b.border,
              opacity: scanning ? 0.55 : 1,
            }}
          >
            <div className="heat-label">{b.label}</div>
            {b.text}
          </div>
        ))}
      </div>

      <div className="li-card">
        <h4>LinkedIn cross-check</h4>
        <ul>
          <li>Account age 8 years · 847 connections · regular posts</li>
          <li>Job titles and dates match the resume</li>
          <li>No contradicting story across resume, cover letter, LinkedIn</li>
        </ul>
      </div>

      <div className="checks-live">
        {scanning && <div className="scan-status">Tracing resume provenance and LinkedIn sanity…</div>}
        {phase === 'done' && <div className="scan-status done">Consistency cleared · {candidate.consistency.score}/100</div>}
        {candidate.consistency.checks.map((chk, i) => {
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
            Run consistency check
          </button>
        </div>
      )}
    </div>
  );
}
