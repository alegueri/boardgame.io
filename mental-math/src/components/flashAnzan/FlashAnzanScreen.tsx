import { useState, useEffect, useRef } from 'react';
import type { FlashAnzanConfig } from '../../types/session';
import { flashAnzanProblem } from '../../engine/generators/flashAnzan';
import { FlashDisplay } from './FlashDisplay';
import { AnswerInput } from '../drill/AnswerInput';
import { FeedbackBanner } from '../drill/FeedbackBanner';
import type { ProblemResult } from '../../types/problem';

type Phase = 'config' | 'countdown' | 'flashing' | 'answering' | 'feedback';

interface FlashAnzanScreenProps {
  onBack: () => void;
  showAbacus: boolean;
}

export function FlashAnzanScreen({ onBack, showAbacus }: FlashAnzanScreenProps) {
  const [config, setConfig] = useState<FlashAnzanConfig>({ digitCount: 1, numberCount: 5, flashSpeedMs: 1000 });
  const [phase, setPhase] = useState<Phase>('config');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [problem, setProblem] = useState(() => flashAnzanProblem(config));
  const [lastResult, setLastResult] = useState<ProblemResult | null>(null);
  const startRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTO() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }

  function startFlashing(p = problem, idx = 0) {
    setCurrentIndex(idx);
    setCurrentValue(p.operands[idx]);
    setPhase('flashing');
    timeoutRef.current = setTimeout(() => {
      if (idx + 1 < p.operands.length) {
        setCurrentValue(null);
        timeoutRef.current = setTimeout(() => startFlashing(p, idx + 1), 200);
      } else {
        setCurrentValue(null);
        startRef.current = performance.now();
        setPhase('answering');
      }
    }, config.flashSpeedMs);
  }

  function handleStart() {
    const p = flashAnzanProblem(config);
    setProblem(p);
    setCountdown(3);
    setPhase('countdown');
  }

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) { startFlashing(problem, 0); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  useEffect(() => () => clearTO(), []);

  function handleAnswer(val: number) {
    const responseTimeMs = Math.round(performance.now() - startRef.current);
    const wasCorrect = val === problem.answer;
    const result: ProblemResult = {
      problem,
      userAnswer: val,
      wasCorrect,
      responseTimeMs,
      timedOut: false,
      timestamp: Date.now(),
    };
    setLastResult(result);
    setPhase('feedback');
  }

  function handleNext() {
    handleStart();
  }

  if (phase === 'config') {
    return (
      <div className="mm-flash-config">
        <div className="mm-screen-header">
          <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onBack}>← Back</button>
          <h2>⚡ Flash Anzan</h2>
        </div>
        <p className="mm-flash-description">
          Numbers will flash one by one. Add them all up mentally. This trains your visuospatial working memory — the same technique used by elite abacus competitors!
        </p>
        <div className="mm-flash-settings">
          <label className="mm-setting">
            <span>Digits per number: <strong>{config.digitCount}</strong></span>
            <input type="range" min={1} max={4} value={config.digitCount}
              onChange={e => setConfig(c => ({ ...c, digitCount: +e.target.value }))} />
          </label>
          <label className="mm-setting">
            <span>Number of flashes: <strong>{config.numberCount}</strong></span>
            <input type="range" min={3} max={15} value={config.numberCount}
              onChange={e => setConfig(c => ({ ...c, numberCount: +e.target.value }))} />
          </label>
          <label className="mm-setting">
            <span>Flash speed: <strong>{config.flashSpeedMs}ms</strong></span>
            <input type="range" min={200} max={2000} step={100} value={config.flashSpeedMs}
              onChange={e => setConfig(c => ({ ...c, flashSpeedMs: +e.target.value }))} />
          </label>
        </div>
        <button className="mm-btn mm-btn-primary mm-btn-lg" onClick={handleStart}>Start!</button>
      </div>
    );
  }

  if (phase === 'countdown') {
    return (
      <div className="mm-flash-countdown">
        <div className="mm-countdown-number">{countdown || 'Go!'}</div>
      </div>
    );
  }

  if (phase === 'flashing') {
    return (
      <div className="mm-flash-active">
        <div className="mm-flash-progress">{currentIndex + 1} / {problem.operands.length}</div>
        <FlashDisplay value={currentValue} showAbacus={showAbacus} />
      </div>
    );
  }

  if (phase === 'answering') {
    return (
      <div className="mm-flash-answering">
        <div className="mm-flash-prompt">What was the total?</div>
        <AnswerInput onSubmit={handleAnswer} />
      </div>
    );
  }

  if (phase === 'feedback' && lastResult) {
    return (
      <div className="mm-flash-feedback">
        <div className="mm-flash-sequence">
          Numbers: {problem.operands.join(' + ')} = <strong>{problem.answer}</strong>
        </div>
        <FeedbackBanner result={lastResult} onNext={handleNext} />
      </div>
    );
  }

  return null;
}
