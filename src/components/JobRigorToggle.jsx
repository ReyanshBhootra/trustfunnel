export default function JobRigorToggle({ rigor, onChange, job }) {
  return (
    <div className="rigor">
      <div className="label">REQUIRED TO REACH A RECRUITER</div>
      <div className="rigor-toggle" role="tablist" aria-label="Verification rigor">
        <button
          type="button"
          role="tab"
          aria-selected={rigor === 's12'}
          className={rigor === 's12' ? 'active' : ''}
          onClick={() => onChange('s12')}
        >
          Stage 1 + 2 sufficient
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={rigor === 'all3'}
          className={rigor === 'all3' ? 'active' : ''}
          onClick={() => onChange('all3')}
        >
          All 3 stages required
        </button>
      </div>
      <p className="hint">{job.whyStrict}</p>
    </div>
  );
}
