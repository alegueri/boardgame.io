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

// ── Soroban Lesson ─────────────────────────────────────────────────────────────

function AbacusLesson({ onBack }: { onBack: () => void }) {
  const [page, setPage] = useState(0);
  const pages = [
    <div key="p0" className="mm-abacus-lesson">
      <div className="mm-abacus-lesson-section">
        <h3>🧮 What is a Soroban?</h3>
        <p>
          The soroban is the Japanese abacus, refined over centuries into one of the most powerful mental arithmetic tools ever created.
          Elite practitioners can add 15 three-digit numbers in under 1.5 seconds — purely in their heads, by visualizing an imaginary abacus.
        </p>
        <p>
          Each <strong>column</strong> represents a place value: ones, tens, hundreds, etc.
          Each column has <strong>one heaven bead</strong> (worth 5) above the divider
          and <strong>four earth beads</strong> (worth 1 each) below it.
        </p>
        <p>
          A bead is <strong>active</strong> (counts toward the value) when it is pushed toward the divider:
          heaven bead moves <em>down</em>, earth beads move <em>up</em>.
        </p>
        <div className="mm-abacus-bead-guide">
          <div className="mm-abacus-bead-item">
            <div className="mm-bead-swatch" /> Active (glowing, near divider)
          </div>
          <div className="mm-abacus-bead-item">
            <div className="mm-bead-swatch inactive" /> Inactive (dark, away from divider)
          </div>
        </div>
      </div>
      <div className="mm-abacus-lesson-section">
        <h3>Reading a column</h3>
        <p>
          Column value = <strong>(heaven bead active? +5 : 0) + number of active earth beads</strong>
        </p>
        <p>
          Example: heaven active + 3 earth active = <strong>5 + 3 = 8</strong>.
          Maximum per column: 5+4 = 9. ✓ Perfect for base-10.
        </p>
        <AbacusView value={8} minColumns={1} />
      </div>
    </div>,

    <div key="p1" className="mm-abacus-lesson">
      <div className="mm-abacus-lesson-section">
        <h3>📍 Place Values</h3>
        <p>
          Columns run right to left: ones → tens → hundreds → thousands.
          The total value of the abacus is the sum of each column's digit × its place value.
        </p>
        <p>Try reading these examples on the abacus below:</p>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--mm-text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>47</div>
            <AbacusView value={47} minColumns={2} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--mm-text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>163</div>
            <AbacusView value={163} minColumns={3} />
          </div>
        </div>
      </div>
      <div className="mm-abacus-lesson-section">
        <h3>Adding on the soroban</h3>
        <p>
          To add 3 to a column: push 3 earth beads toward the divider.
          If only 1 earth bead is free, use <strong>complementary addition</strong>:
          activate the heaven bead (+5) and deactivate 2 earth beads (−2), net +3.
        </p>
        <p>
          The brain learns these complementary moves as muscle memory — this is how speed comes.
          Practice until "add 7 to 6" doesn't require thought: just the moves.
        </p>
      </div>
    </div>,

    <div key="p2" className="mm-abacus-lesson">
      <div className="mm-abacus-lesson-section">
        <h3>🧠 Mental Abacus (Anzan)</h3>
        <p>
          <strong>Anzan</strong> (暗算) means "dark calculation" — doing soroban arithmetic purely in your mind,
          with no physical device. You visualize the bead positions and mentally move them.
        </p>
        <p>
          Research shows anzan uses the brain's <strong>visuospatial cortex</strong> rather than the verbal system.
          This is why experts can calculate while holding a conversation — they're using a different mental channel.
        </p>
        <p>
          The path: physical abacus → anzan. First, build the movements until they're reflexive on a real (or screen) abacus.
          Then close your eyes and visualize. The Flash Anzan mode trains this directly.
        </p>
      </div>
      <div className="mm-abacus-lesson-section">
        <h3>🏆 How to get fast</h3>
        <p>
          1. <strong>Read drill</strong> — look at the abacus, say the number instantly. Target: under 1 second.<br />
          2. <strong>Build drill</strong> — hear/see a number, set the beads. Target: under 2 seconds.<br />
          3. <strong>Flash Anzan</strong> — numbers flash briefly, add them mentally. Start slow (1000ms), work toward 300ms.<br />
          4. Eyes-closed practice — visualize the abacus during your commute or idle moments.
        </p>
      </div>
    </div>,

    <div key="p3" className="mm-abacus-lesson">
      <div className="mm-abacus-lesson-section">
        <h3>✋ Chisanbop — Finger Mental Math</h3>
        <p>
          Chisanbop (치산법) is a Korean finger-counting technique that turns your hands into a portable abacus.
          Each finger represents a digit, and you can represent numbers 0–99 with both hands.
        </p>
        <div className="mm-chisanbop-hands">
          <div className="mm-chisanbop-hand">
            <h4>Right Hand (ones)</h4>
            <ul>
              <li>Index finger = 1</li>
              <li>Middle finger = 2</li>
              <li>Ring finger = 3</li>
              <li>Pinky = 4</li>
              <li>Right thumb = 5</li>
            </ul>
          </div>
          <div className="mm-chisanbop-hand">
            <h4>Left Hand (tens)</h4>
            <ul>
              <li>Index finger = 10</li>
              <li>Middle finger = 20</li>
              <li>Ring finger = 30</li>
              <li>Pinky = 40</li>
              <li>Left thumb = 50</li>
            </ul>
          </div>
        </div>
        <p>
          Press fingers down on a surface to "activate" them. The sum of all pressed fingers = your number.
          To show 37: left ring (30) + right thumb (5) + right index+middle (1+2=2) → 37.
        </p>
        <p>
          Use Chisanbop to maintain a running total during mental addition. Your fingers hold intermediate values
          so your verbal memory stays free for the next operation.
        </p>
      </div>
    </div>,
  ];

  return (
    <div className="mm-mode-screen">
      <div className="mm-screen-header">
        <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onBack}>← Back</button>
        <h2>📖 Abacus Guide</h2>
        <span style={{ color: 'var(--mm-text-muted)', fontSize: '0.85rem' }}>{page + 1}/{pages.length}</span>
      </div>
      {pages[page]}
      <div className="mm-lesson-actions" style={{ marginTop: 0 }}>
        {page > 0 && <button className="mm-btn mm-btn-ghost" onClick={() => setPage(p => p - 1)}>← Previous</button>}
        {page < pages.length - 1
          ? <button className="mm-btn mm-btn-primary" onClick={() => setPage(p => p + 1)}>Next →</button>
          : <button className="mm-btn mm-btn-primary mm-btn-lg" onClick={onBack}>Start Practicing →</button>}
      </div>
    </div>
  );
}

// ── Read Drill: see abacus → type number ───────────────────────────────────────

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
    <div className="mm-mode-screen">
      <div className="mm-screen-header">
        <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onBack}>← Back</button>
        <h2>👁️ Read the Abacus</h2>
      </div>
      <p className="mm-screen-desc">Look at the abacus below. Type the number it shows. Train until you can read it in under 1 second.</p>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--mm-text-muted)' }}>Digits:</span>
        {[1, 2, 3, 4].map(d => (
          <button
            key={d}
            className={`mm-pick-btn ${digits === d ? 'selected' : ''}`}
            onClick={() => { setDigits(d); nextProblem(d); }}
          >{d}</button>
        ))}
      </div>

      {!result ? (
        <div className="mm-abacus-drill">
          <div className="mm-abacus-read-display">
            <AbacusView value={target} minColumns={digits} />
          </div>
          <p className="mm-abacus-drill-prompt">What number does this show?</p>
          <AnswerInput onSubmit={handleAnswer} />
        </div>
      ) : (
        <FeedbackBanner result={result} onNext={() => nextProblem()} />
      )}
    </div>
  );
}

// ── Build Drill: see number → set the beads ────────────────────────────────────

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
      steps: [`The correct answer is ${target}`, `You showed ${userValue}`],
    },
    userAnswer: userValue,
    wasCorrect,
    responseTimeMs,
    timedOut: false,
    timestamp: Date.now(),
  };

  return (
    <div className="mm-mode-screen">
      <div className="mm-screen-header">
        <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onBack}>← Back</button>
        <h2>🖐️ Build the Number</h2>
      </div>
      <p className="mm-screen-desc">A number appears. Click the beads to represent it on the abacus, then hit Check.</p>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--mm-text-muted)' }}>Digits:</span>
        {[1, 2, 3, 4].map(d => (
          <button
            key={d}
            className={`mm-pick-btn ${digits === d ? 'selected' : ''}`}
            onClick={() => { setDigits(d); nextProblem(d); }}
          >{d}</button>
        ))}
      </div>

      {phase === 'drill' ? (
        <div className="mm-abacus-drill">
          <p className="mm-abacus-drill-prompt">Set the abacus to:</p>
          <div className="mm-abacus-target">{target}</div>
          <InteractiveAbacus ref={abacusRef} numColumns={Math.max(digits, 2)} />
          <button className="mm-btn mm-btn-primary mm-btn-lg" onClick={handleCheck}>
            Check ✓
          </button>
        </div>
      ) : (
        <div className="mm-abacus-drill">
          <p className="mm-abacus-drill-prompt">Target was:</p>
          <div className="mm-abacus-target">{target}</div>
          <AbacusView value={target} minColumns={Math.max(digits, 2)} />
          <FeedbackBanner result={fakeResult} onNext={() => nextProblem()} />
        </div>
      )}
    </div>
  );
}

// ── Free Play ──────────────────────────────────────────────────────────────────

function FreePlay({ onBack }: { onBack: () => void }) {
  return (
    <div className="mm-mode-screen">
      <div className="mm-screen-header">
        <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onBack}>← Back</button>
        <h2>🎮 Free Play</h2>
      </div>
      <p className="mm-screen-desc">Just click around. Get comfortable with the abacus before drilling.</p>
      <InteractiveAbacus numColumns={4} />
    </div>
  );
}

// ── Main AbacusMode ────────────────────────────────────────────────────────────

interface AbacusModeProps {
  onBack: () => void;
}

export function AbacusMode({ onBack }: AbacusModeProps) {
  const [sub, setSub] = useState<SubMode>('home');

  if (sub === 'learn') return <AbacusLesson onBack={() => setSub('home')} />;
  if (sub === 'read') return <ReadDrill onBack={() => setSub('home')} />;
  if (sub === 'build') return <BuildDrill onBack={() => setSub('home')} />;
  if (sub === 'free') return <FreePlay onBack={() => setSub('home')} />;

  return (
    <div className="mm-abacus-mode">
      <div className="mm-screen-header">
        <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onBack}>← Back</button>
        <h2>🧮 Abacus Training</h2>
      </div>

      <p className="mm-screen-desc">
        Master the soroban — the Japanese abacus used by mental arithmetic champions. Learn to read and set bead positions,
        then graduate to visualizing the abacus entirely in your mind (Anzan). Also covers <strong>Chisanbop</strong> finger counting.
      </p>

      <div className="mm-abacus-sub-grid">
        <button className="mm-abacus-sub-card" onClick={() => setSub('learn')}>
          <div className="mm-abacus-sub-emoji">📖</div>
          <div className="mm-abacus-sub-title">Learn</div>
          <div className="mm-abacus-sub-desc">How the soroban works, Anzan & Chisanbop guide</div>
        </button>

        <button className="mm-abacus-sub-card" onClick={() => setSub('free')}>
          <div className="mm-abacus-sub-emoji">🎮</div>
          <div className="mm-abacus-sub-title">Free Play</div>
          <div className="mm-abacus-sub-desc">Click beads freely, get comfortable</div>
        </button>

        <button className="mm-abacus-sub-card" onClick={() => setSub('read')}>
          <div className="mm-abacus-sub-emoji">👁️</div>
          <div className="mm-abacus-sub-title">Read It</div>
          <div className="mm-abacus-sub-desc">See bead config → type the number</div>
        </button>

        <button className="mm-abacus-sub-card" onClick={() => setSub('build')}>
          <div className="mm-abacus-sub-emoji">🖐️</div>
          <div className="mm-abacus-sub-title">Build It</div>
          <div className="mm-abacus-sub-desc">See a number → set the beads correctly</div>
        </button>
      </div>

      <div className="mm-abacus-lesson-section" style={{ fontSize: '0.85rem', color: 'var(--mm-text-muted)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--mm-text)' }}>Recommended path:</strong>{' '}
        Learn → Free Play → Read It (1-digit) → Build It (1-digit) → increase digits → Flash Anzan
      </div>
    </div>
  );
}
