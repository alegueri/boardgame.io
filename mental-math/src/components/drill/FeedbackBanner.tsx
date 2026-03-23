import { useEffect } from 'react';
import type { ProblemResult } from '../../types/problem';

interface FeedbackBannerProps {
  result: ProblemResult;
  onNext: () => void;
}

export function FeedbackBanner({ result, onNext }: FeedbackBannerProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Enter') onNext();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onNext]);

  const speedLabel = result.responseTimeMs < 1000 ? '⚡ Lightning!' :
    result.responseTimeMs < 2000 ? '🚀 Fast' :
    result.responseTimeMs < 4000 ? '👍 Good' : '🐢 Slow';

  return (
    <div className={`mm-feedback ${result.wasCorrect ? 'mm-feedback-correct' : 'mm-feedback-wrong'}`}>
      <div className="mm-feedback-result">
        {result.wasCorrect ? '✓ Correct!' : `✗ Answer: ${result.problem.answer}`}
      </div>
      <div className="mm-feedback-time">
        {(result.responseTimeMs / 1000).toFixed(2)}s — {speedLabel}
      </div>
      {!result.wasCorrect && result.problem.steps && (
        <div className="mm-feedback-steps">
          <div className="mm-feedback-steps-title">How to do it:</div>
          {result.problem.steps.map((s, i) => <div key={i} className="mm-feedback-step">{s}</div>)}
        </div>
      )}
      {result.problem.hint && result.wasCorrect && (
        <div className="mm-feedback-hint">💡 {result.problem.hint}</div>
      )}
      <button className="mm-btn mm-btn-primary mm-btn-lg mm-feedback-next" onClick={onNext}>
        Next →
      </button>
    </div>
  );
}
