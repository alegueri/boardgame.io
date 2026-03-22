import { useState, useRef, useCallback } from 'react';
import { AbacusView } from '../components/flashAnzan/AbacusView';
import { InteractiveAbacus, type InteractiveAbacusHandle } from '../components/flashAnzan/InteractiveAbacus';
import { AnswerInput } from '../components/drill/AnswerInput';
import { FeedbackBanner } from '../components/drill/FeedbackBanner';
import type { ProblemResult } from '../types/problem';

type SubMode = 'home' | 'learn' | 'read' | 'build' | 'free';

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeProblem(maxDigits: number) {
  const max = Math.pow(10, maxDigits) - 1;
  const min = Math.pow(10, maxDigits - 1);
  return randomInt(min, max);
}

// ── Soroban Lesson ──────────────────────────────────────────────

function AbacusLesson({ onBack }: { onBack: () => void }) {
  const [page, setPage] = useState(0);

  const pages = [
    {
      title: 'What is a Soroban?',
      emoji: '🧮',
      body: (
        <>
          <p className="mm-setup-desc">
            The soroban is the Japanese abacus — one of the most powerful mental arithmetic tools ever created.
            Elite practitioners can add fifteen 3-digit numbers in under 1.5 seconds, purely in their heads.
          </p>
          <div className="mm-abacus-info-card">
            <div className="mm-abacus-info-row">
              <span className="mm-abacus-info-label">Heaven bead</span>
              <span className="mm-abacus-info-val">worth <strong>5</strong> — slides down to divider when active</span>
            </div>
            <div className="mm-abacus-info-row">
              <span className="mm-abacus-info-label">Earth beads</span>
              <span className="mm-abacus-info-val">worth <strong>1 each</strong> — slide up to divider when active</span>
            </div>
            <div className="mm-abacus-info-row">
              <span className="mm-abacus-info-label">Column max</span>
              <span className="mm-abacus-info-val">5 + 4 = <strong>9</strong> ✓ perfect for base-10</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--t3)' }}>Example: heaven + 3 earth = 8</p>
            <AbacusView value={8} minColumns={1} />
          </div>
        </>
      ),
    },
    {
      title: 'Place Values',
      emoji: '📍',
      body: (
        <>
          <p className="mm-setup-desc">
            Columns run right → left: ones, tens, hundreds, thousands.
            The total is the sum of each column's digit × its place value.
          </p>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[{ v: 47, cols: 2 }, { v: 163, cols: 3 }, { v: 8, cols: 1 }].map(({ v, cols }) => (
              <div key={v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{v}</span>
                <AbacusView value={v} minColumns={cols} />
              </div>
            ))}
          </div>
          <div className="mm-abacus-info-card">
            <p style={{ fontSize: '0.85rem', color: 'var(--t2)', lineHeight: 1.7 }}>
              <strong>Complementary addition:</strong> to add 3 when only 1 earth bead is free —
              activate the heaven bead (+5) and deactivate 2 earth beads (−2). Net: +3.
              These complementary moves become muscle memory with practice.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Mental Abacus (Anzan)',
      emoji: '🧠',
      body: (
        <>
          <p className="mm-setup-desc">
            <strong>Anzan</strong> (暗算) — "dark calculation" — means doing soroban arithmetic purely in your mind,
            visualizing bead positions without a physical device.
          </p>
          <div className="mm-abacus-info-card">
            <div className="mm-abacus-info-row">
              <span className="mm-abacus-info-label">Why it works</span>
              <span className="mm-abacus-info-val">Uses the visuospatial cortex, not the verbal system — you can calculate while talking</span>
            </div>
            <div className="mm-abacus-info-row">
              <span className="mm-abacus-info-label">The path</span>
              <span className="mm-abacus-info-val">Physical → reflexive → eyes-closed visualization</span>
            </div>
          </div>
          <div className="mm-abacus-steps">
            {['Read drill — see abacus, say number. Target: under 1 second.',
              'Build drill — see number, set beads. Target: under 2 seconds.',
              'Flash Anzan — numbers flash briefly, add them mentally.',
              'Eyes-closed — visualize during commute or idle moments.'].map((s, i) => (
              <div key={i} className="mm-lesson-step">
                <span className="mm-lesson-step-num">{i + 1}</span>
                <span className="mm-lesson-step-text">{s}</span>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      title: 'Chisanbop — Finger Math',
      emoji: '✋',
      body: (
        <>
          <p className="mm-setup-desc">
            Chisanbop (치산법) turns your hands into a portable abacus. Represent 0–99 with both hands.
          </p>
          <div className="mm-chisanbop-hands">
            <div className="mm-chisanbop-hand">
              <h4>Right Hand — ones</h4>
              <ul>
                <li>Index = 1</li>
                <li>Middle = 2</li>
                <li>Ring = 3</li>
                <li>Pinky = 4</li>
                <li>Thumb = 5</li>
              </ul>
            </div>
            <div className="mm-chisanbop-hand">
              <h4>Left Hand — tens</h4>
              <ul>
                <li>Index = 10</li>
                <li>Middle = 20</li>
                <li>Ring = 30</li>
                <li>Pinky = 40</li>
                <li>Thumb = 50</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--t2)', lineHeight: 1.7 }}>
            Example — show 37: left ring (30) + right thumb (5) + right index+middle (2) = 37.
            Use it to hold intermediate sums while your verbal memory handles the next number.
          </p>
        </>
      ),
    },
  ];

  const current = pages[page];
  const isLast = page === pages.length - 1;
  const pct = ((page + 1) / pages.length) * 100;

  return (
    <div className="mm-lesson-screen">
      <div className="mm-lesson-topbar">
        <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onBack}>← Back</button>
        <span className="mm-lesson-technique">🧮 Abacus Guide</span>
        <span className="mm-lesson-step-counter">{page + 1} / {pages.length}</span>
      </div>

      <div className="mm-lesson-progress-track">
        <div className="mm-lesson-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="mm-lesson-dots">
        {pages.map((_, i) => (
          <button
            key={i}
            className={`mm-lesson-dot ${i === page ? 'active' : i < page ? 'done' : ''}`}
            onClick={() => i <= page && setPage(i)}
          />
        ))}
      </div>

      <div className="mm-lesson-card">
        <h2 className="mm-lesson-title">{current.emoji} {current.title}</h2>
        {current.body}
      </div>

      <div className="mm-lesson-actions">
        {page > 0 && (
          <button className="mm-btn mm-btn-ghost" onClick={() => setPage(p => p - 1)}>← Prev</button>
        )}
        {isLast ? (
          <button className="mm-btn mm-btn-primary mm-btn-lg" onClick={onBack}>Start Practicing →</button>
        ) : (
          <button className="mm-btn mm-btn-primary mm-btn-lg" onClick={() => setPage(p => p + 1)}>Next →</button>
        )}
      </div>
    </div>
  );
}

// ── Read Drill ──────────────────────────────────────────────────

function ReadDrill({ onBack }: { onBack: () => void }) {
  const [digits, setDigits] = useState(2);
  const [target, setTarget] = useState(() => makeProblem(2));
  const [result, setResult] = useState<ProblemResult | null>(null);
  const startRef = useRef(performance.now());

  const nextProblem = useCallback((d = digits) => {
    setTarget(makeProblem(d));
    setResult(null);
    startRef.current = performance.now();
  }, [digits]);

  function handleAnswer(val: number) {
    const responseTimeMs = Math.round(performance.now() - startRef.current);
    setResult({
      problem: {
        id: `abacus-read:${target}`,
        techniqueId: 'foundations',
        question: `[Abacus showing ${target}]`,
        operands: [target],
        answer: target,
      },
      userAnswer: val,
      wasCorrect: val === target,
      responseTimeMs,
      timedOut: false,
      timestamp: Date.now(),
    });
  }

  return (
    <div className="mm-setup-screen">
      <div className="mm-setup-back">
        <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onBack}>← Back</button>
      </div>
      <div className="mm-setup-hero">
        <div className="mm-setup-icon">👁️</div>
        <h1 className="mm-setup-title">Read It</h1>
        <p className="mm-setup-desc">Look at the abacus and type the number it shows. Target: under 1 second.</p>
      </div>

      <div className="mm-abacus-digit-row">
        <span style={{ fontSize: '0.85rem', color: 'var(--t3)', fontWeight: 500 }}>Digits:</span>
        {[1, 2, 3, 4].map(d => (
          <button
            key={d}
            className={`mm-pick-btn ${digits === d ? 'selected' : ''}`}
            onClick={() => { setDigits(d); nextProblem(d); }}
          >{d}</button>
        ))}
      </div>

      {!result ? (
        <div className="mm-abacus-drill-card">
          <p className="mm-abacus-drill-prompt">What number does this show?</p>
          <AbacusView value={target} minColumns={digits} />
          <AnswerInput onSubmit={handleAnswer} />
        </div>
      ) : (
        <FeedbackBanner result={result} onNext={() => nextProblem()} />
      )}
    </div>
  );
}

// ── Build Drill ─────────────────────────────────────────────────

function BuildDrill({ onBack }: { onBack: () => void }) {
  const [digits, setDigits] = useState(2);
  const [target, setTarget] = useState(() => makeProblem(2));
  const [phase, setPhase] = useState<'drill' | 'feedback'>('drill');
  const [wasCorrect, setWasCorrect] = useState(false);
  const [userValue, setUserValue] = useState(0);
  const [responseTimeMs, setResponseTimeMs] = useState(0);
  const startRef = useRef(performance.now());
  const abacusRef = useRef<InteractiveAbacusHandle>(null);

  function nextProblem(d = digits) {
    setTarget(makeProblem(d));
    setPhase('drill');
    abacusRef.current?.reset();
    startRef.current = performance.now();
  }

  function handleCheck() {
    const val = abacusRef.current?.getValue() ?? 0;
    setUserValue(val);
    setWasCorrect(val === target);
    setResponseTimeMs(Math.round(performance.now() - startRef.current));
    setPhase('feedback');
  }

  const fakeResult: ProblemResult = {
    problem: {
      id: `abacus-build:${target}`,
      techniqueId: 'foundations',
      question: `Set abacus to ${target}`,
      operands: [target],
      answer: target,
      steps: [`Correct answer: ${target}`, `Your abacus showed: ${userValue}`],
    },
    userAnswer: userValue,
    wasCorrect,
    responseTimeMs,
    timedOut: false,
    timestamp: Date.now(),
  };

  return (
    <div className="mm-setup-screen">
      <div className="mm-setup-back">
        <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onBack}>← Back</button>
      </div>
      <div className="mm-setup-hero">
        <div className="mm-setup-icon">🖐️</div>
        <h1 className="mm-setup-title">Build It</h1>
        <p className="mm-setup-desc">A number appears. Click the beads to show it on the abacus, then hit Check.</p>
      </div>

      <div className="mm-abacus-digit-row">
        <span style={{ fontSize: '0.85rem', color: 'var(--t3)', fontWeight: 500 }}>Digits:</span>
        {[1, 2, 3, 4].map(d => (
          <button
            key={d}
            className={`mm-pick-btn ${digits === d ? 'selected' : ''}`}
            onClick={() => { setDigits(d); nextProblem(d); }}
          >{d}</button>
        ))}
      </div>

      {phase === 'drill' ? (
        <div className="mm-abacus-drill-card">
          <p className="mm-abacus-drill-prompt">Set the abacus to:</p>
          <div className="mm-abacus-target">{target}</div>
          <InteractiveAbacus ref={abacusRef} numColumns={Math.max(digits, 2)} />
          <button className="mm-btn mm-btn-primary mm-btn-lg" onClick={handleCheck}>Check ✓</button>
        </div>
      ) : (
        <div className="mm-abacus-drill-card">
          <p className="mm-abacus-drill-prompt">The correct answer was:</p>
          <div className="mm-abacus-target">{target}</div>
          <AbacusView value={target} minColumns={Math.max(digits, 2)} />
          <FeedbackBanner result={fakeResult} onNext={() => nextProblem()} />
        </div>
      )}
    </div>
  );
}

// ── Free Play ───────────────────────────────────────────────────

function FreePlay({ onBack }: { onBack: () => void }) {
  return (
    <div className="mm-setup-screen">
      <div className="mm-setup-back">
        <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onBack}>← Back</button>
      </div>
      <div className="mm-setup-hero">
        <div className="mm-setup-icon">🎮</div>
        <h1 className="mm-setup-title">Free Play</h1>
        <p className="mm-setup-desc">Click around freely. Get comfortable with the bead mechanics before drilling.</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <InteractiveAbacus numColumns={4} />
      </div>
    </div>
  );
}

// ── Main AbacusMode home ────────────────────────────────────────

interface AbacusModeProps {
  onBack: () => void;
}

const SUB_MODES = [
  { id: 'learn' as SubMode, emoji: '📖', title: 'Learn',     desc: 'Soroban mechanics, Anzan & Chisanbop guide' },
  { id: 'free'  as SubMode, emoji: '🎮', title: 'Free Play', desc: 'Click beads freely, get comfortable'          },
  { id: 'read'  as SubMode, emoji: '👁️', title: 'Read It',   desc: 'See bead config → type the number'            },
  { id: 'build' as SubMode, emoji: '🖐️', title: 'Build It',  desc: 'See a number → set the beads correctly'       },
];

export function AbacusMode({ onBack }: AbacusModeProps) {
  const [sub, setSub] = useState<SubMode>('home');

  if (sub === 'learn') return <AbacusLesson onBack={() => setSub('home')} />;
  if (sub === 'read')  return <ReadDrill    onBack={() => setSub('home')} />;
  if (sub === 'build') return <BuildDrill   onBack={() => setSub('home')} />;
  if (sub === 'free')  return <FreePlay     onBack={() => setSub('home')} />;

  return (
    <div className="mm-setup-screen">
      <div className="mm-setup-back">
        <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onBack}>← Back</button>
      </div>
      <div className="mm-setup-hero">
        <div className="mm-setup-icon">🧮</div>
        <h1 className="mm-setup-title">Abacus</h1>
        <p className="mm-setup-desc">
          Master the soroban used by mental arithmetic champions. Learn to read and set beads,
          then visualize the entire abacus in your mind — Anzan.
        </p>
      </div>

      <div className="mm-abacus-sub-grid">
        {SUB_MODES.map(({ id, emoji, title, desc }) => (
          <button key={id} className="mm-abacus-sub-card" onClick={() => setSub(id)}>
            <div className="mm-abacus-sub-emoji">{emoji}</div>
            <div className="mm-abacus-sub-title">{title}</div>
            <div className="mm-abacus-sub-desc">{desc}</div>
          </button>
        ))}
      </div>

      <div className="mm-abacus-tip">
        <span className="mm-abacus-tip-label">Recommended path</span>
        Learn → Free Play → Read It (1-digit) → Build It → increase digits → Flash Anzan
      </div>
    </div>
  );
}
