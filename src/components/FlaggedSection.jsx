import CandidateRow from './CandidateRow.jsx';

export default function FlaggedSection({ candidates, openId, onToggle, highlightId }) {
  if (!candidates.length) return null;

  return (
    <div className="flagged-wrap">
      <div className="section-label">
        <h3>HELD — IDENTITY NOT ESTABLISHED</h3>
        <span>{candidates.length} candidate{candidates.length === 1 ? '' : 's'}</span>
      </div>
      <p className="held-banner">
        Failed Stage 1. Stage 2 and Stage 3 never ran. Visible to the recruiter, excluded from the ranked queue — nothing is silently deleted.
      </p>
      {candidates.map((c) => (
        <CandidateRow
          key={c.id}
          candidate={c}
          rank={null}
          open={openId === c.id}
          onToggle={() => onToggle(c.id)}
          variant="flagged"
          highlight={highlightId === c.id}
        />
      ))}
    </div>
  );
}
