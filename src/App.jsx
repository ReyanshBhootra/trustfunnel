import { useState } from 'react';
import RecruiterDashboard from './components/RecruiterDashboard.jsx';
import CandidateFlow from './components/CandidateFlow.jsx';
import { STATS } from './data/mock.js';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [highlightId, setHighlightId] = useState(null);
  const [statIdx, setStatIdx] = useState(0);
  const stat = STATS[statIdx];

  function showInQueue(id) {
    setHighlightId(id);
    setView('dashboard');
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>
            Trust<span>Funnel</span>
          </h1>
          <span className="tag">ATS</span>
        </div>
        <nav className="view-switch" aria-label="Demo views">
          <button
            type="button"
            className={view === 'flow' ? 'active' : ''}
            onClick={() => setView('flow')}
          >
            Candidate verification
          </button>
          <button
            type="button"
            className={view === 'dashboard' ? 'active' : ''}
            onClick={() => setView('dashboard')}
          >
            Recruiter queue
          </button>
        </nav>
        <div className="recruiter">
          <div className="avatar">AR</div>
          <div>
            <strong>A. Reeves</strong>
            <div>Staff recruiter · Platform</div>
          </div>
        </div>
      </header>

      {view === 'dashboard' ? (
        <RecruiterDashboard highlightId={highlightId} />
      ) : (
        <CandidateFlow onShowInQueue={showInQueue} />
      )}

      <footer className="stats-bar">
        <div>
          <span className="stat">{stat.stat}</span>
          {stat.detail}
          <span className="src"> · {stat.source}</span>
        </div>
        <div className="stats-nav">
          <button type="button" aria-label="Previous stat" onClick={() => setStatIdx((i) => (i + STATS.length - 1) % STATS.length)}>
            ‹
          </button>
          <button type="button" aria-label="Next stat" onClick={() => setStatIdx((i) => (i + 1) % STATS.length)}>
            ›
          </button>
        </div>
      </footer>
    </div>
  );
}
