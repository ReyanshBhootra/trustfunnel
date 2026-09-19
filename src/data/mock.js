/**
 * All demo scores, flags, and job policy live here.
 * Tweak numbers between now and stage time without touching component logic.
 */

export const STATS = [
  {
    stat: '41%',
    detail: 'of organizations have hired a fraudulent candidate without knowing it',
    source: 'GetReal Security',
  },
  {
    stat: '+1,300%',
    detail: 'rise in deepfake hiring fraud in 2024',
    source: 'Pindrop',
  },
  {
    stat: '70 min',
    detail: 'to build a convincing deepfake candidate with zero technical skill',
    source: 'HR Dive',
  },
  {
    stat: '55.54%',
    detail: 'human accuracy detecting deepfakes — barely above a coin flip',
    source: '2025 meta-analysis, 56 studies',
  },
  {
    stat: '1 in 4',
    detail: 'candidate profiles worldwide could be fake by 2028',
    source: 'Gartner',
  },
];

export const JOBS = [
  {
    id: 'swe-platform',
    title: 'Senior Software Engineer',
    team: 'Platform',
    location: 'Remote · US',
    openings: 2,
    sensitivity: 'high',
    defaultRigor: 'all3',
    whyStrict:
      'Production system access, remote-only. North Korean IT-worker fraud pattern applies — require all three stages.',
    description:
      'Own reliability of our multi-tenant pipeline. Distributed systems in Go or Rust, on-call, prior work with identity or payments a plus.',
    requirements: [
      { label: 'Distributed systems', weight: 'high' },
      { label: 'Go or Rust in production', weight: 'high' },
      { label: 'On-call / incident response', weight: 'med' },
      { label: 'Identity, payments, or infra', weight: 'med' },
      { label: '8+ years engineering', weight: 'low' },
    ],
  },
  {
    id: 'recruiter-coord',
    title: 'Recruiting Coordinator',
    team: 'People',
    location: 'New York, NY',
    openings: 4,
    sensitivity: 'standard',
    defaultRigor: 's12',
    whyStrict:
      'High-volume, on-site role. Identity + consistency is usually enough to reach a human; Fit is optional.',
    description:
      'Run scheduling, candidate communication, and onsite logistics for engineering hiring. High volume, high judgment.',
    requirements: [
      { label: 'High-volume scheduling', weight: 'high' },
      { label: 'ATS fluency (Greenhouse/Ashby)', weight: 'high' },
      { label: 'Written candidate communication', weight: 'med' },
      { label: 'On-site coordination', weight: 'med' },
    ],
  },
];

const CHECK = (label, pass, note) => ({ label, pass, note });

export const CANDIDATES = {
  'swe-platform': [
    {
      id: 'maya-ellison',
      name: 'Maya Ellison',
      initials: 'ME',
      accent: '#c9a24b',
      currentTitle: 'Staff Engineer, Lattice',
      years: 8,
      location: 'Brooklyn, NY',
      appliedAt: '2 hours ago',
      source: 'LinkedIn Easy Apply',
      liveDemo: true,
      identity: {
        score: 96,
        cleared: true,
        checks: [
          CHECK('Baseline match', true, 'Selfie ↔ government ID, 98'),
          CHECK('Reaction naturalness', true, 'Spontaneous head-turn, no lag'),
          CHECK('Voice consistency', true, 'Pitch + lip-sync stable across 4 samples'),
          CHECK('Cross-application scan', true, 'No matching face/voice under another name'),
        ],
      },
      consistency: {
        score: 90,
        cleared: true,
        checks: [
          CHECK('Resume provenance', true, 'Built across 6 sessions over 11 days'),
          CHECK('Typing rhythm', true, 'Natural pause/hesitation pattern'),
          CHECK('Title & claim verification', true, 'Lattice, dates, and title match public records'),
          CHECK('LinkedIn sanity', true, 'Account age 8 yrs · 847 connections · regular posts'),
        ],
      },
      fit: {
        score: 90,
        cleared: true,
        checks: [
          CHECK('Role match', true, 'Distributed systems, Go, on-call — 90% weighted'),
          CHECK('Prior verification', true, 'Verified at Northstar Health, 2023 — no flags'),
          CHECK('Application pattern', true, '3 targeted applications in 2 weeks, not spray-and-pray'),
        ],
      },
      flags: [],
      priorHistory: {
        seen: true,
        label: 'Verified before',
        detail: 'Cleared TrustFunnel at Northstar Health (2023). No flags on file.',
      },
    },
    {
      id: 'kenji-nakamura',
      name: 'Kenji Nakamura',
      initials: 'KN',
      accent: '#5b93d9',
      currentTitle: 'Senior Backend, Stripe',
      years: 6,
      location: 'Seattle, WA',
      appliedAt: '5 hours ago',
      source: 'Company site',
      identity: {
        score: 91,
        cleared: true,
        checks: [
          CHECK('Baseline match', true, 'Selfie ↔ ID, 93'),
          CHECK('Reaction naturalness', true, 'Natural micro-expression on prompt'),
          CHECK('Voice consistency', true, 'Stable across 3 samples'),
          CHECK('Cross-application scan', true, 'No duplicate identity'),
        ],
      },
      consistency: {
        score: 88,
        cleared: true,
        checks: [
          CHECK('Resume provenance', true, 'Incremental edits, 4 sessions'),
          CHECK('Typing rhythm', true, 'Human keystroke variance'),
          CHECK('Title & claim verification', true, 'Stripe tenure matches'),
          CHECK('LinkedIn sanity', true, 'Account age 9 yrs · thin posting, otherwise real'),
        ],
      },
      fit: {
        score: 73,
        cleared: true,
        checks: [
          CHECK('Role match', true, 'Payments infra is adjacent; less distributed-systems depth'),
          CHECK('Prior verification', true, 'First time through TrustFunnel'),
          CHECK('Application pattern', true, 'Focused search, 5 applications this month'),
        ],
      },
      flags: [],
      priorHistory: {
        seen: false,
        label: 'First verification',
        detail: 'No prior TrustFunnel history.',
      },
    },
    {
      id: 'priya-raman',
      name: 'Priya Raman',
      initials: 'PR',
      accent: '#6fae7c',
      currentTitle: 'Senior Engineer, Datadog',
      years: 7,
      location: 'Austin, TX',
      appliedAt: 'yesterday',
      source: 'Referral — J. Okonkwo',
      identity: {
        score: 88,
        cleared: true,
        checks: [
          CHECK('Baseline match', true, 'Selfie ↔ ID, 90'),
          CHECK('Reaction naturalness', true, 'Passed live challenge'),
          CHECK('Voice consistency', true, 'No lip-sync drift'),
          CHECK('Cross-application scan', true, 'Unique face/voice print'),
        ],
      },
      consistency: {
        score: 71,
        cleared: true,
        checks: [
          CHECK('Resume provenance', true, 'Mostly incremental; one pasted block in skills'),
          CHECK('Typing rhythm', true, 'Human cadence'),
          CHECK('Title & claim verification', true, 'Datadog dates check out'),
          CHECK('LinkedIn sanity', false, 'Profile created 3 days ago · 12 connections · no posts'),
        ],
      },
      fit: {
        score: 84,
        cleared: true,
        checks: [
          CHECK('Role match', true, 'Observability + Go services, strong overlap'),
          CHECK('Prior verification', true, 'First time through TrustFunnel'),
          CHECK('Application pattern', true, 'Genuine focused search'),
        ],
      },
      flags: [
        {
          severity: 'warn',
          label: 'LinkedIn profile created 3 days ago',
          detail:
            'Account has 12 connections and no posting history. Resume and identity still check out — recruiter call.',
        },
      ],
      priorHistory: {
        seen: false,
        label: 'First verification',
        detail: 'No prior TrustFunnel history.',
      },
    },
    {
      id: 'samira-haddad',
      name: 'Samira Haddad',
      initials: 'SH',
      accent: '#8b92a5',
      currentTitle: 'Staff Engineer, Northwind Labs',
      years: 5,
      location: 'Chicago, IL',
      appliedAt: 'yesterday',
      source: 'LinkedIn Easy Apply',
      identity: {
        score: 86,
        cleared: true,
        checks: [
          CHECK('Baseline match', true, 'Selfie ↔ ID, 88'),
          CHECK('Reaction naturalness', true, 'Passed'),
          CHECK('Voice consistency', true, 'Passed'),
          CHECK('Cross-application scan', true, 'Unique print'),
        ],
      },
      consistency: {
        score: 68,
        cleared: true,
        checks: [
          CHECK('Resume provenance', false, 'Experience section pasted as one 47-second block'),
          CHECK('Typing rhythm', true, 'Cover letter typed live'),
          CHECK('Title & claim verification', false, "Resume: Staff 2022–24 · LinkedIn: Senior for same dates"),
          CHECK('LinkedIn sanity', true, 'Account age 6 yrs, plausible network'),
        ],
      },
      fit: {
        score: 59,
        cleared: true,
        checks: [
          CHECK('Role match', true, 'Partial — backend CRUD, limited distributed systems'),
          CHECK('Prior verification', true, 'First time through TrustFunnel'),
          CHECK('Application pattern', true, 'Broader spray than peers, still human-paced'),
        ],
      },
      flags: [
        {
          severity: 'warn',
          label: 'Resume section pasted as a single block',
          detail: 'Experience section appeared in 47 seconds with uniform timing — typical of a paste, not a rewrite.',
        },
        {
          severity: 'warn',
          label: 'Title inflation vs. LinkedIn',
          detail: "Resume lists Staff Engineer (2022–2024); LinkedIn lists Senior Engineer for the same window.",
        },
      ],
      priorHistory: {
        seen: false,
        label: 'First verification',
        detail: 'No prior TrustFunnel history.',
      },
    },
    {
      id: 'owen-briggs',
      name: 'Owen Briggs',
      initials: 'OB',
      accent: '#5b93d9',
      currentTitle: 'Senior Engineer, Shopify',
      years: 6,
      location: 'Toronto, ON',
      appliedAt: '3 hours ago',
      source: 'Company site',
      identity: {
        score: 90,
        cleared: true,
        checks: [
          CHECK('Baseline match', true, 'Selfie ↔ ID, 92'),
          CHECK('Reaction naturalness', true, 'Passed'),
          CHECK('Voice consistency', true, 'Passed'),
          CHECK('Cross-application scan', true, 'Unique print'),
        ],
      },
      consistency: {
        score: 85,
        cleared: true,
        checks: [
          CHECK('Resume provenance', true, 'Incremental, 5 sessions'),
          CHECK('Typing rhythm', true, 'Human cadence'),
          CHECK('Title & claim verification', true, 'Shopify tenure matches'),
          CHECK('LinkedIn sanity', true, 'Account age 7 yrs'),
        ],
      },
      fit: {
        score: null,
        cleared: false,
        checks: [],
      },
      flags: [],
      priorHistory: {
        seen: false,
        label: 'Awaiting Stage 3',
        detail: 'Identity and consistency cleared. Fit scoring has not run yet.',
      },
    },
    {
      id: 'jordan-hale',
      name: 'Jordan Hale',
      initials: 'JH',
      accent: '#8b92a5',
      currentTitle: 'Software Engineer, Notion',
      years: 4,
      location: 'San Francisco, CA',
      appliedAt: '38 minutes ago',
      source: 'LinkedIn Easy Apply',
      identity: {
        score: 88,
        cleared: true,
        checks: [
          CHECK('Baseline match', true, 'Selfie ↔ ID, 89'),
          CHECK('Reaction naturalness', true, 'Passed'),
          CHECK('Voice consistency', true, 'Passed'),
          CHECK('Cross-application scan', true, 'Unique print'),
        ],
      },
      consistency: {
        score: null,
        cleared: false,
        checks: [],
      },
      fit: {
        score: null,
        cleared: false,
        checks: [],
      },
      flags: [],
      priorHistory: {
        seen: false,
        label: 'In progress',
        detail: 'Cleared identity. Resume/LinkedIn consistency is still running.',
      },
    },
    {
      id: 'victor-lang',
      name: 'Victor Lang',
      initials: 'VL',
      accent: '#d9694f',
      currentTitle: 'Senior Engineer, (unverified)',
      years: 7,
      location: 'Remote',
      appliedAt: '14 minutes ago',
      source: 'LinkedIn Easy Apply',
      identity: {
        score: 28,
        cleared: false,
        checks: [
          CHECK('Baseline match', false, 'Face drifted from ID under head movement'),
          CHECK('Reaction naturalness', false, 'Flat, delayed response to unscripted prompt'),
          CHECK('Voice consistency', false, 'Pitch lock + lip-sync drift on sample 3'),
          CHECK('Cross-application scan', false, "Match: 'Nathan Cole', applied 11 days ago"),
        ],
      },
      consistency: {
        score: null,
        cleared: false,
        checks: [],
      },
      fit: {
        score: null,
        cleared: false,
        checks: [],
      },
      flags: [
        {
          severity: 'critical',
          label: 'Cross-application match detected',
          detail:
            "Same face and voice print as 'Nathan Cole', who applied to this posting 11 days ago under a different identity. Stage 2 and Stage 3 were never run.",
        },
        {
          severity: 'critical',
          label: 'Identity gate failed',
          detail: 'Did not clear the live-human threshold. Held out of the ranked queue.',
        },
      ],
      priorHistory: {
        seen: true,
        label: 'Previously flagged',
        detail: "Matched to flagged identity 'Nathan Cole' (11 days ago). Same print, new name.",
      },
    },
  ],

  'recruiter-coord': [
    {
      id: 'lena-cho',
      name: 'Lena Cho',
      initials: 'LC',
      accent: '#c9a24b',
      currentTitle: 'Recruiting Coordinator, Figma',
      years: 4,
      location: 'New York, NY',
      appliedAt: '1 hour ago',
      source: 'Referral',
      identity: {
        score: 94,
        cleared: true,
        checks: [
          CHECK('Baseline match', true, 'Selfie ↔ ID, 96'),
          CHECK('Reaction naturalness', true, 'Passed'),
          CHECK('Voice consistency', true, 'Passed'),
          CHECK('Cross-application scan', true, 'Unique print'),
        ],
      },
      consistency: {
        score: 91,
        cleared: true,
        checks: [
          CHECK('Resume provenance', true, 'Incremental over 8 days'),
          CHECK('Typing rhythm', true, 'Human cadence'),
          CHECK('Title & claim verification', true, 'Figma tenure matches'),
          CHECK('LinkedIn sanity', true, 'Account age 6 yrs · active'),
        ],
      },
      fit: {
        score: 86,
        cleared: true,
        checks: [
          CHECK('Role match', true, 'High-volume engineering recruiting ops'),
          CHECK('Prior verification', true, 'Verified at two prior companies, no flags'),
          CHECK('Application pattern', true, 'Targeted, 2 applications'),
        ],
      },
      flags: [],
      priorHistory: {
        seen: true,
        label: 'Verified before',
        detail: 'Cleared TrustFunnel twice. No flags.',
      },
    },
    {
      id: 'marcus-adeyemi',
      name: 'Marcus Adeyemi',
      initials: 'MA',
      accent: '#5b93d9',
      currentTitle: 'TA Operations, Coinbase',
      years: 5,
      location: 'New York, NY',
      appliedAt: '4 hours ago',
      source: 'Company site',
      identity: {
        score: 90,
        cleared: true,
        checks: [
          CHECK('Baseline match', true, 'Passed'),
          CHECK('Reaction naturalness', true, 'Passed'),
          CHECK('Voice consistency', true, 'Passed'),
          CHECK('Cross-application scan', true, 'Unique print'),
        ],
      },
      consistency: {
        score: 84,
        cleared: true,
        checks: [
          CHECK('Resume provenance', true, 'Incremental'),
          CHECK('Typing rhythm', true, 'Human cadence'),
          CHECK('Title & claim verification', true, 'Coinbase dates match'),
          CHECK('LinkedIn sanity', true, 'Account age 5 yrs'),
        ],
      },
      fit: {
        score: 74,
        cleared: true,
        checks: [
          CHECK('Role match', true, 'Ops-heavy; less onsite coordination'),
          CHECK('Prior verification', true, 'First time through TrustFunnel'),
          CHECK('Application pattern', true, 'Genuine search'),
        ],
      },
      flags: [],
      priorHistory: {
        seen: false,
        label: 'First verification',
        detail: 'No prior TrustFunnel history.',
      },
    },
    {
      id: 'tess-walker',
      name: 'Tess Walker',
      initials: 'TW',
      accent: '#6fae7c',
      currentTitle: 'Executive Assistant, Remote-first startup',
      years: 3,
      location: 'Jersey City, NJ',
      appliedAt: 'yesterday',
      source: 'LinkedIn Easy Apply',
      identity: {
        score: 87,
        cleared: true,
        checks: [
          CHECK('Baseline match', true, 'Passed'),
          CHECK('Reaction naturalness', true, 'Passed'),
          CHECK('Voice consistency', true, 'Passed'),
          CHECK('Cross-application scan', true, 'Unique print'),
        ],
      },
      consistency: {
        score: 80,
        cleared: true,
        checks: [
          CHECK('Resume provenance', true, 'Incremental'),
          CHECK('Typing rhythm', true, 'Human cadence'),
          CHECK('Title & claim verification', true, 'EA tenure matches'),
          CHECK('LinkedIn sanity', true, 'Account age 4 yrs'),
        ],
      },
      fit: {
        score: null,
        cleared: false,
        checks: [],
      },
      flags: [],
      priorHistory: {
        seen: false,
        label: 'Awaiting Stage 3',
        detail: 'Identity and consistency cleared. Fit not required under current policy.',
      },
    },
    {
      id: 'chris-pell',
      name: 'Chris Pell',
      initials: 'CP',
      accent: '#d9694f',
      currentTitle: 'Coordinator, (unverified)',
      years: 2,
      location: 'Remote',
      appliedAt: '22 minutes ago',
      source: 'LinkedIn Easy Apply',
      identity: {
        score: 34,
        cleared: false,
        checks: [
          CHECK('Baseline match', false, 'ID photo does not hold under movement'),
          CHECK('Reaction naturalness', false, 'No spontaneous reaction to prompt'),
          CHECK('Voice consistency', false, 'Cloned-voice pitch lock'),
          CHECK('Cross-application scan', true, 'No prior match on file'),
        ],
      },
      consistency: {
        score: null,
        cleared: false,
        checks: [],
      },
      fit: {
        score: null,
        cleared: false,
        checks: [],
      },
      flags: [
        {
          severity: 'critical',
          label: 'Identity gate failed',
          detail: 'Synthetic reaction + voice pitch lock. Stage 2 and Stage 3 were never run.',
        },
      ],
      priorHistory: {
        seen: false,
        label: 'First attempt',
        detail: 'No prior record — failed identity on first pass.',
      },
    },
  ],
};

export const LIVE_CANDIDATE_ID = 'maya-ellison';

export const STAGE_META = [
  { key: 'identity', n: 1, name: 'Identity', short: 'Live human, not a deepfake or proxy' },
  { key: 'consistency', n: 2, name: 'Consistency', short: 'Resume and LinkedIn tell one real story' },
  { key: 'fit', n: 3, name: 'Fit', short: 'Verified experience vs. this posting' },
];

export function stageState(candidate, key) {
  const stage = candidate[key];
  if (!stage || stage.score == null) return 'pending';
  return stage.cleared ? 'cleared' : 'failed';
}

export function completedStages(candidate) {
  return ['identity', 'consistency', 'fit'].filter((k) => candidate[k]?.score != null);
}

/** Average of completed stages. Flagged candidates (failed Stage 1) have no trust score. */
export function displayScore(candidate) {
  if (candidate.identity && candidate.identity.cleared === false) return null;
  const scores = completedStages(candidate)
    .map((k) => candidate[k].score)
    .filter((n) => typeof n === 'number');
  if (!scores.length) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function meetsRigor(candidate, rigor) {
  if (!candidate.identity?.cleared) return false;
  if (rigor === 's12') return Boolean(candidate.consistency?.cleared);
  return Boolean(candidate.consistency?.cleared && candidate.fit?.cleared);
}

export function bucketCandidate(candidate, rigor) {
  if (candidate.identity && candidate.identity.cleared === false) return 'flagged';
  if (meetsRigor(candidate, rigor)) return 'ready';
  return 'in_progress';
}

export function partition(candidates, rigor) {
  const ready = [];
  const inProgress = [];
  const flagged = [];
  for (const c of candidates) {
    const bucket = bucketCandidate(c, rigor);
    if (bucket === 'flagged') flagged.push(c);
    else if (bucket === 'ready') ready.push(c);
    else inProgress.push(c);
  }
  const byScore = (a, b) => (displayScore(b) ?? 0) - (displayScore(a) ?? 0);
  ready.sort(byScore);
  inProgress.sort(byScore);
  return { ready, inProgress, flagged };
}
