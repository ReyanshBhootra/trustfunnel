import { useEffect, useMemo, useState } from 'react';
import { CANDIDATES, JOBS, partition } from '../data/mock.js';
import JobRigorToggle from './JobRigorToggle.jsx';
import FlaggedSection from './FlaggedSection.jsx';
import CandidateRow from './CandidateRow.jsx';

export default function RecruiterDashboard({ highlightId }) {
  const [jobId, setJobId] = useState(JOBS[0].id);
  const job = JOBS.find((j) => j.id === jobId);
  const [rigorByJob, setRigorByJob] = useState(() =>
    Object.fromEntries(JOBS.map((j) => [j.id, j.defaultRigor]))
  );
  const [openId, setOpenId] = useState(highlightId || null);

  useEffect(() => {
    if (!highlightId) return;
    const owner = JOBS.find((j) => CANDIDATES[j.id].some((c) => c.id === highlightId));
    if (owner) setJobId(owner.id);
    setOpenId(highlightId);
  }, [highlightId]);

  const rigor = rigorByJob[jobId];
  const list = CANDIDATES[jobId];
  const { ready, inProgress, flagged } = useMemo(() => partition(list, rigor), [list, rigor]);

  function selectJob(id) {
    setJobId(id);
    setOpenId(null);
  }

  function toggleRow(id) {
    setOpenId((cur) => (cur === id ? null : id));
  }

  return (
    <div className="workspace">
      <aside className="job-rail">
        <div>
          <div className="rail-label">POSTINGS</div>
          {JOBS.map((j) => {
            const n = CANDIDATES[j.id].length;
            return (
              <button
                key={j.id}
                type="button"
                className={`job-card ${j.id === jobId ? 'active' : ''}`}
                onClick={() => selectJob(j.id)}
              >
                <div className="j-title">{j.title}</div>
                <div className="j-meta">
                  <span>
                    {j.team} · {j.location}
                  </span>
                </div>
                <div className="j-meta">
                  <span>{n} in funnel</span>
                  <span className="j-sens">{j.sensitivity === 'high' ? 'SENSITIVE' : 'STANDARD'}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="rail-policy">
          <div className="k">POLICY LIVES ON THE JOB</div>
          <p>
            Low-risk volume roles can stop at Identity + Consistency. Sensitive roles (system access, remote-only) require all three — every time.
          </p>
        </div>
      </aside>

      <section className="queue">
        <div className="queue-head">
          <div>
            <h2>{job.title}</h2>
            <p className="sub">
              {job.team} · {job.location} · {job.openings} openings · {job.description}
            </p>
            <div className="counts">
              <span>
                <b>{ready.length}</b> ready for a human
              </span>
              <span>
                <b>{inProgress.length}</b> in progress
              </span>
              <span className="held">
                <b>{flagged.length}</b> held at identity
              </span>
            </div>
          </div>
          <JobRigorToggle
            job={job}
            rigor={rigor}
            onChange={(next) => setRigorByJob((m) => ({ ...m, [jobId]: next }))}
          />
        </div>

        <div className="queue-body">
          <div className="section-label">
            <h3>HUMAN REVIEW QUEUE · HIGHEST TRUST FIRST</h3>
            <span>The system ranks. You decide.</span>
          </div>
          {ready.length === 0 && (
            <p className="empty">No one has cleared the bar for this posting yet. Loosen rigor, or wait on in-progress candidates.</p>
          )}
          {ready.map((c, i) => (
            <CandidateRow
              key={c.id}
              candidate={c}
              rank={i + 1}
              open={openId === c.id}
              onToggle={() => toggleRow(c.id)}
              highlight={highlightId === c.id}
            />
          ))}

          <div className="section-label" style={{ marginTop: 22 }}>
            <h3>IN PROGRESS</h3>
            <span>Cleared identity — still in the funnel</span>
          </div>
          {inProgress.length === 0 && <p className="empty">No partial completions right now.</p>}
          {inProgress.map((c) => (
            <CandidateRow
              key={c.id}
              candidate={c}
              rank={null}
              open={openId === c.id}
              onToggle={() => toggleRow(c.id)}
              highlight={highlightId === c.id}
              variant="in_progress"
            />
          ))}

          <FlaggedSection
            candidates={flagged}
            openId={openId}
            onToggle={toggleRow}
            highlightId={highlightId}
          />
        </div>
      </section>
    </div>
  );
}
