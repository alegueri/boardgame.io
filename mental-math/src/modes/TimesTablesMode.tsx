import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type React from 'react';
import type { Problem, ProblemResult } from '../types/problem';
import type { ProgressStore } from '../types/progress';
import { getStore, recordResult } from '../store/progressStore';
import { TimerBar } from '../components/drill/TimerBar';
import { AnswerInput } from '../components/drill/AnswerInput';
import { FeedbackBanner } from '../components/drill/FeedbackBanner';

// ── Problem pool builder ────────────────────────────────────────────────────────

function buildPool(tables: number[]): Problem[] {
  const pool: Problem[] = [];
  for (const table of tables) {
    for (let b = 1; b <= 12; b++) {
      const [lo, hi] = [Math.min(table, b), Math.max(table, b)];
      pool.push({
        id: `foundations:${lo}:${hi}`,
        techniqueId: 'foundations',
        question: `${table} × ${b}`,
        operands: [table, b],
        answer: table * b,
      });
    }
  }
  return pool;
}

// ── Weighted sampler using SRS history ─────────────────────────────────────────
// Facts that are: due for review, have low ease factor, or poor recent accuracy
// all get a higher weight so they show up more in the generated problem set.

function weightedGenerate(tables: number[], count: number, store: ProgressStore): Problem[] {
  const pool = buildPool(tables);
  const now = Date.now();

  const weighted = pool.map(p => {
    const fact = store.facts[p.id];
    if (!fact) return { p, w: 4 }; // never seen → high priority

    const isDue = fact.srsCard.nextReviewAt <= now;
    const isStruggling = fact.srsCard.easeFactor < 1.8;
    const recentAcc = fact.accuracyWindow.length > 0
      ? fact.accuracyWindow.filter(Boolean).length / fact.accuracyWindow.length
      : 1;
    const isSlow = fact.responseTimes.length > 0
      && (fact.responseTimes.reduce((s, t) => s + t, 0) / fact.responseTimes.length) > 3000;

    let w = 1;
    if (isDue)         w += 3;
    if (isStruggling)  w += 2;
    if (recentAcc < 0.7) w += 2;
    if (isSlow)        w += 1;
    return { p, w };
  });

  const totalW = weighted.reduce((s, x) => s + x.w, 0);
  const result: Problem[] = [];

  for (let i = 0; i < count; i++) {
    let r = Math.random() * totalW;
    for (const { p, w } of weighted) {
      r -= w;
      if (r <= 0) { result.push(p); break; }
    }
    // Fallback in case of floating-point edge
    if (result.length <= i) result.push(weighted[weighted.length - 1].p);
  }

  return result;
}

// ── Countdown timer hook ────────────────────────────────────────────────────────

function useCountdown(seconds: number | null, onExpire: () => void) {
  const [remaining, setRemaining] = useState(seconds ?? 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef(0);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const start = useCallback(() => {
    if (!seconds) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    endTimeRef.current = Date.now() + seconds * 1000;
    setRemaining(seconds);
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, endTimeRef.current - Date.now());
      setRemaining(Math.ceil(left / 1000));
      if (left <= 0) {
        clearInterval(intervalRef.current!);
        onExpireRef.current();
      }
    }, 80);
  }, [seconds]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const fraction = seconds ? Math.max(0, remaining / seconds) : 1;
  return { remaining, fraction, start, stop };
}

// ── Drill (queue-based, re-queues wrong answers within session) ────────────────

const MAX_REQUEUES = 2; // max times a single fact can be re-queued per session

interface DrillProps {
  initialProblems: Problem[];
  timerSeconds: number | null;
  onComplete: (results: ProblemResult[]) => void;
  onQuit: () => void;
}

type DrillPhase = 'question' | 'feedback';

function TablesDrill({ initialProblems, timerSeconds, onComplete, onQuit }: DrillProps) {
  // The live queue — starts as the generated list, grows when wrong answers are re-inserted
  const [queue, setQueue] = useState<Problem[]>(initialProblems);
  const [doneCount, setDoneCount] = useState(0);
  const [requeueCount, setRequeueCount] = useState<Record<string, number>>({});
  const [requeueTotal, setRequeuTotal] = useState(0);
  const [results, setResults] = useState<ProblemResult[]>([]);
  const [phase, setPhase] = useState<DrillPhase>('question');
  const [lastResult, setLastResult] = useState<ProblemResult | null>(null);
  const startRef = useRef(performance.now());

  const problem = queue[0];

  const handleTimeout = useCallback(() => {
    if (phase !== 'question' || !problem) return;
    const ms = Math.round(performance.now() - startRef.current);
    const result: ProblemResult = {
      problem,
      userAnswer: null,
      wasCorrect: false,
      responseTimeMs: ms,
      timedOut: true,
      timestamp: Date.now(),
    };
    // Write to SRS immediately
    recordResult(result);
    setResults(prev => [...prev, result]);
    setLastResult(result);
    // Re-queue if under limit
    const rq = requeueCount[problem.id] ?? 0;
    if (rq < MAX_REQUEUES) {
      setRequeueCount(prev => ({ ...prev, [problem.id]: rq + 1 }));
      setRequeuTotal(n => n + 1);
      setQueue(prev => {
        const rest = prev.slice(1);
        const at = Math.min(2, rest.length);
        return [...rest.slice(0, at), problem, ...rest.slice(at)];
      });
    } else {
      setQueue(prev => prev.slice(1));
    }
    setDoneCount(d => d + 1);
    setPhase('feedback');
  }, [phase, problem, requeueCount]);

  const countdown = useCountdown(timerSeconds, handleTimeout);

  useEffect(() => {
    if (!problem) return;
    if (phase === 'question') {
      startRef.current = performance.now();
      countdown.start();
    } else {
      countdown.stop();
    }
  }, [problem?.id, phase]);

  function handleAnswer(val: number) {
    countdown.stop();
    const ms = Math.round(performance.now() - startRef.current);
    const wasCorrect = val === problem.answer;
    const result: ProblemResult = {
      problem,
      userAnswer: val,
      wasCorrect,
      responseTimeMs: ms,
      timedOut: false,
      timestamp: Date.now(),
    };
    // Write to SRS immediately
    recordResult(result);
    setResults(prev => [...prev, result]);
    setLastResult(result);
    if (!wasCorrect) {
      const rq = requeueCount[problem.id] ?? 0;
      if (rq < MAX_REQUEUES) {
        setRequeueCount(prev => ({ ...prev, [problem.id]: rq + 1 }));
        setRequeuTotal(n => n + 1);
        setQueue(prev => {
          const rest = prev.slice(1);
          const at = Math.min(2, rest.length);
          return [...rest.slice(0, at), problem, ...rest.slice(at)];
        });
      } else {
        setQueue(prev => prev.slice(1));
      }
    } else {
      setQueue(prev => prev.slice(1));
    }
    setDoneCount(d => d + 1);
    setPhase('feedback');
  }

  function handleNext() {
    if (queue.length === 0) {
      onComplete(results);
    } else {
      setPhase('question');
    }
  }

  // Auto-advance after feedback — shorter delay for correct, longer for wrong/timeout
  const resultsRef = useRef(results);
  resultsRef.current = results;

  useEffect(() => {
    if (phase !== 'feedback') return;
    const delay = lastResult?.wasCorrect ? 700 : 1400;
    const id = setTimeout(() => {
      if (queue.length === 0) {
        onComplete(resultsRef.current);
      } else {
        setPhase('question');
      }
    }, delay);
    return () => clearTimeout(id);
  }, [phase]);

  if (!problem && phase === 'feedback') {
    // Last problem just answered — show final feedback then let user click Next to go to summary
  }

  const totalDoneAndLeft = doneCount + queue.length;
  const progressPct = (doneCount / totalDoneAndLeft) * 100;

  return (
    <div className="mm-drill-screen" style={{ '--drill-glow': 'rgba(10,132,255,0.14)' } as React.CSSProperties}>
      <div className="mm-drill-topbar">
        <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onQuit}>✕ Quit</button>
        <div className="mm-tt-drill-meta">
          <span className="mm-tt-progress-label">{doneCount} done · {queue.length} left</span>
          {requeueTotal > 0 && (
            <span className="mm-tt-requeue-badge">↩ {requeueTotal} re-queued</span>
          )}
        </div>
      </div>

      {/* Overall progress — grows if wrong answers added */}
      <div className="mm-tt-progress-track">
        <div className="mm-tt-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Per-question countdown bar */}
      {timerSeconds && phase === 'question' && (
        <TimerBar fraction={countdown.fraction} remaining={countdown.remaining} total={timerSeconds} />
      )}

      {phase === 'question' && problem && (
        <div className="mm-tt-question-wrap">
          <div className="mm-tt-question">{problem.question} = ?</div>
          <AnswerInput onSubmit={handleAnswer} />
        </div>
      )}

      {phase === 'feedback' && lastResult && (
        <div className="mm-tt-feedback-wrap">
          {lastResult.timedOut && (
            <div className="mm-tt-timeout-banner">
              ⏱ Time's up! &nbsp; {lastResult.problem.question} = <strong>{lastResult.problem.answer}</strong>
              {(requeueCount[lastResult.problem.id] ?? 0) > 0 && (
                <span className="mm-tt-requeue-note"> · coming back!</span>
              )}
            </div>
          )}
          {!lastResult.wasCorrect && !lastResult.timedOut && (requeueCount[lastResult.problem.id] ?? 0) > 0 && (
            <div className="mm-tt-wrong-banner">
              ↩ Adding <strong>{lastResult.problem.question}</strong> back into the queue
            </div>
          )}
          <FeedbackBanner
            result={lastResult}
            onNext={queue.length === 0 ? () => onComplete(results) : handleNext}
          />
        </div>
      )}
    </div>
  );
}

// ── Summary ─────────────────────────────────────────────────────────────────────

interface SummaryProps {
  results: ProblemResult[];
  tables: number[];
  timerSeconds: number | null;
  onRetry: () => void;
  onBack: () => void;
}

function Summary({ results, tables, timerSeconds, onRetry, onBack }: SummaryProps) {
  // Only count first attempt at each unique problem for accuracy headline
  const firstAttempts = results.filter((r, i) =>
    results.findIndex(x => x.problem.id === r.problem.id && x.problem.question === r.problem.question) === i
  );
  const correct = firstAttempts.filter(r => r.wasCorrect).length;
  const total = firstAttempts.length;
  const accuracy = Math.round((correct / total) * 100);
  const avgTime = Math.round(firstAttempts.reduce((s, r) => s + r.responseTimeMs, 0) / total);

  // Per-table stats (first attempts only)
  const tableStats = tables.map(table => {
    const tr = firstAttempts.filter(r => r.problem.operands[0] === table || r.problem.operands[1] === table);
    const tc = tr.filter(r => r.wasCorrect).length;
    const avgT = tr.length > 0 ? Math.round(tr.reduce((s, r) => s + r.responseTimeMs, 0) / tr.length) : 0;
    return { table, correct: tc, total: tr.length, avgTime: avgT };
  }).sort((a, b) => {
    const scoreA = a.total > 0 ? (a.correct / a.total) * 2 - (a.avgTime / 5000) : -99;
    const scoreB = b.total > 0 ? (b.correct / b.total) * 2 - (b.avgTime / 5000) : -99;
    return scoreA - scoreB; // weakest first
  });

  function cellColor(s: typeof tableStats[0]) {
    if (s.total === 0) return 'var(--mm-border)';
    const acc = s.correct / s.total;
    if (acc < 0.6) return 'var(--mm-red)';
    if (acc < 0.9 || s.avgTime > (timerSeconds ? timerSeconds * 700 : 3000)) return 'var(--mm-amber)';
    return 'var(--mm-green)';
  }

  // Weak individual facts (wrong or slow on first attempt)
  const weakFacts = firstAttempts
    .filter(r => !r.wasCorrect || r.responseTimeMs > 3000)
    .sort((a, b) => (a.wasCorrect ? 1 : 0) - (b.wasCorrect ? 1 : 0) || b.responseTimeMs - a.responseTimeMs)
    .slice(0, 8);

  // Load current SRS state to show improvement context
  const store = getStore();
  const requeuedCount = results.length - firstAttempts.length;

  return (
    <div className="mm-tt-summary">
      <h2 className="mm-tt-summary-title">Session Complete</h2>

      <div className="mm-tt-headline">
        <div className="mm-tt-stat">
          <span className="mm-tt-stat-val" style={{
            color: accuracy >= 90 ? 'var(--mm-green)' : accuracy >= 70 ? 'var(--mm-amber)' : 'var(--mm-red)'
          }}>{accuracy}%</span>
          <span className="mm-tt-stat-label">Accuracy</span>
        </div>
        <div className="mm-tt-stat">
          <span className="mm-tt-stat-val">{correct}/{total}</span>
          <span className="mm-tt-stat-label">Correct (1st try)</span>
        </div>
        <div className="mm-tt-stat">
          <span className="mm-tt-stat-val" style={{
            color: avgTime < 2000 ? 'var(--mm-green)' : avgTime < 4000 ? 'var(--mm-amber)' : 'var(--mm-red)'
          }}>{(avgTime / 1000).toFixed(1)}s</span>
          <span className="mm-tt-stat-label">Avg Speed</span>
        </div>
      </div>

      {requeuedCount > 0 && (
        <div className="mm-tt-requeue-summary">
          ↩ {requeuedCount} wrong answer{requeuedCount !== 1 ? 's were' : ' was'} re-drilled until correct
        </div>
      )}

      <div className="mm-tt-section-label">By table — weakest first</div>
      <div className="mm-tt-table-grid">
        {tableStats.map(s => (
          <div key={s.table} className="mm-tt-table-cell" style={{ borderColor: cellColor(s) }}>
            <div className="mm-tt-table-num" style={{ color: cellColor(s) }}>×{s.table}</div>
            <div className="mm-tt-table-acc">{s.total > 0 ? `${s.correct}/${s.total}` : '—'}</div>
            <div className="mm-tt-table-time">{s.total > 0 ? `${(s.avgTime / 1000).toFixed(1)}s` : ''}</div>
          </div>
        ))}
      </div>

      {weakFacts.length > 0 && (
        <>
          <div className="mm-tt-section-label">Drill these next time</div>
          <div className="mm-tt-weak-list">
            {weakFacts.map((r, i) => {
              const factData = store.facts[r.problem.id];
              const attempts = factData?.totalAttempts ?? 0;
              return (
                <div key={i} className="mm-tt-weak-row">
                  <span className="mm-tt-weak-q">
                    {r.problem.question} = <strong>{r.problem.answer}</strong>
                  </span>
                  <div className="mm-tt-weak-right">
                    <span className="mm-tt-weak-acc" style={{ color: r.wasCorrect ? 'var(--mm-amber)' : 'var(--mm-red)' }}>
                      {r.wasCorrect ? '✓ slow' : '✗ wrong'} · {(r.responseTimeMs / 1000).toFixed(1)}s
                    </span>
                    {attempts > 0 && (
                      <span className="mm-tt-weak-history">
                        {Math.round((factData!.totalCorrect / attempts) * 100)}% lifetime
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="mm-tt-summary-actions">
        <button className="mm-btn mm-btn-primary mm-btn-lg" onClick={onRetry}>Try Again</button>
        <button className="mm-btn mm-btn-ghost" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}

// ── Setup screen ─────────────────────────────────────────────────────────────────

const TIMER_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Off', value: null },
  { label: '3s', value: 3 },
  { label: '5s', value: 5 },
  { label: '8s', value: 8 },
  { label: '10s', value: 10 },
  { label: '15s', value: 15 },
];
const COUNT_OPTIONS = [10, 20, 30, 50, 100];

// ── Main component ────────────────────────────────────────────────────────────────

interface TimesTablesModeProps {
  onBack: () => void;
}

type PagePhase = 'setup' | 'drilling' | 'summary';

export function TimesTablesMode({ onBack }: TimesTablesModeProps) {
  const [phase, setPhase] = useState<PagePhase>('setup');
  const [selectedTables, setSelectedTables] = useState<Set<number>>(new Set([2, 3, 4, 5, 6, 7, 8, 9, 10]));
  const [timerSeconds, setTimerSeconds] = useState<number | null>(5);
  const [problemCount, setProblemCount] = useState(20);
  const [results, setResults] = useState<ProblemResult[]>([]);
  const [sessionKey, setSessionKey] = useState(0); // increment to force new problem generation

  // Generate weighted problems fresh each session using current SRS state
  const problems = useMemo(() => {
    const store = getStore();
    return weightedGenerate([...selectedTables], problemCount, store);
  }, [sessionKey]);

  function toggleTable(n: number) {
    setSelectedTables(prev => {
      const next = new Set(prev);
      if (next.has(n)) { if (next.size > 1) next.delete(n); }
      else next.add(n);
      return next;
    });
  }

  function handleComplete(r: ProblemResult[]) {
    setResults(r);
    setPhase('summary');
  }

  function handleRetry() {
    setSessionKey(k => k + 1); // triggers new weighted generation
    setPhase('drilling');
  }

  function handleStart() {
    setSessionKey(k => k + 1);
    setPhase('drilling');
  }

  if (phase === 'drilling') {
    return (
      <TablesDrill
        initialProblems={problems}
        timerSeconds={timerSeconds}
        onComplete={handleComplete}
        onQuit={() => setPhase('setup')}
      />
    );
  }

  if (phase === 'summary') {
    return (
      <div className="mm-app-inner">
        <Summary
          results={results}
          tables={[...selectedTables].sort((a, b) => a - b)}
          timerSeconds={timerSeconds}
          onRetry={handleRetry}
          onBack={() => setPhase('setup')}
        />
      </div>
    );
  }

  // ── Setup ──
  // Preview which facts the SRS system thinks need most work
  const store = getStore();
  const now = Date.now();
  const dueCount = [...selectedTables].reduce((count, table) => {
    for (let b = 1; b <= 12; b++) {
      const [lo, hi] = [Math.min(table, b), Math.max(table, b)];
      const fact = store.facts[`foundations:${lo}:${hi}`];
      if (!fact || fact.srsCard.nextReviewAt <= now) count++;
    }
    return count;
  }, 0);

  return (
    <div className="mm-mode-screen">
      <div className="mm-screen-header">
        <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onBack}>← Back</button>
        <h2>✖️ Times Tables</h2>
      </div>

      <p className="mm-screen-desc">
        Wrong answers come back within the session. Your history is tracked across sessions —
        facts you struggle with automatically appear more often.
      </p>

      {dueCount > 0 && (
        <div className="mm-tt-srs-notice">
          📚 <strong>{dueCount}</strong> of your selected facts are due for review based on past sessions
        </div>
      )}

      {/* Table picker */}
      <div className="mm-tt-section">
        <div className="mm-tt-section-header">
          <span className="mm-tt-section-label">Tables to drill</span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={() => setSelectedTables(new Set([1,2,3,4,5,6,7,8,9,10,11,12]))}>All</button>
            <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={() => setSelectedTables(new Set([2]))}>Clear</button>
          </div>
        </div>
        <div className="mm-tt-table-picker">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(n => {
            // Count how many facts for this table are SRS-due
            let tableDue = 0;
            for (let b = 1; b <= 12; b++) {
              const [lo, hi] = [Math.min(n, b), Math.max(n, b)];
              const fact = store.facts[`foundations:${lo}:${hi}`];
              if (!fact || fact.srsCard.nextReviewAt <= now) tableDue++;
            }
            const hasHistory = Object.keys(store.facts).some(k => k.startsWith(`foundations:`) && k.split(':').slice(1).map(Number).includes(n));
            return (
              <button
                key={n}
                className={`mm-tt-table-toggle ${selectedTables.has(n) ? 'selected' : ''}`}
                onClick={() => toggleTable(n)}
                title={hasHistory ? `×${n}: ${tableDue}/12 facts due` : `×${n}: not yet drilled`}
              >
                ×{n}
                {hasHistory && tableDue === 12 && <span className="mm-tt-due-dot" />}
              </button>
            );
          })}
        </div>
        <div className="mm-tt-selected-hint">
          {[...selectedTables].sort((a, b) => a - b).map(n => `×${n}`).join(', ')}
        </div>
      </div>

      {/* Cutoff timer */}
      <div className="mm-tt-section">
        <div className="mm-tt-section-label">Cutoff timer per question</div>
        <div className="mm-tt-options-row">
          {TIMER_OPTIONS.map(opt => (
            <button
              key={String(opt.value)}
              className={`mm-pick-btn ${timerSeconds === opt.value ? 'selected' : ''}`}
              onClick={() => setTimerSeconds(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {timerSeconds !== null && (
          <p className="mm-tt-timer-hint">
            ⏱ {timerSeconds}s limit — no answer = marked wrong and re-queued. Forces real recall, not counting.
          </p>
        )}
      </div>

      {/* Problem count */}
      <div className="mm-tt-section">
        <div className="mm-tt-section-label">Starting problems</div>
        <div className="mm-tt-options-row">
          {COUNT_OPTIONS.map(n => (
            <button
              key={n}
              className={`mm-pick-btn ${problemCount === n ? 'selected' : ''}`}
              onClick={() => setProblemCount(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="mm-tt-timer-hint">Wrong answers add extra repetitions — final count may be higher.</p>
      </div>

      <button
        className="mm-btn mm-btn-primary mm-btn-lg"
        onClick={handleStart}
        disabled={selectedTables.size === 0}
      >
        Start →
      </button>
    </div>
  );
}
