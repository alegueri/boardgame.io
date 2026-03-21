import { useEffect } from 'react';
import type { SessionConfig } from '../../types/session';
import type { Problem } from '../../types/problem';
import { useSession } from '../../hooks/useSession';
import { useTimer } from '../../hooks/useTimer';
import { ProblemDisplay } from './ProblemDisplay';
import { AnswerInput } from './AnswerInput';
import { FeedbackBanner } from './FeedbackBanner';
import { TimerBar } from './TimerBar';
import type { Session } from '../../types/session';

interface DrillScreenProps {
  config: SessionConfig;
  problems: Problem[];
  onComplete: (session: Session) => void;
  onQuit: () => void;
}

export function DrillScreen({ config, problems, onComplete, onQuit }: DrillScreenProps) {
  const { phase, session, currentProblem, lastResult, problemIndex, start, submitAnswer, next } = useSession(config, problems);

  const timer = useTimer(config.timerSeconds, () => {
    if (phase === 'drilling') submitAnswer(null, true);
  });

  useEffect(() => { start(); }, []);

  useEffect(() => {
    if (phase === 'drilling' && config.timerSeconds) timer.start();
    if (phase === 'feedback') timer.stop();
  }, [phase]);

  useEffect(() => {
    if (phase === 'summary' && session) onComplete(session);
  }, [phase]);

  if (phase === 'idle') return null;

  if (phase === 'summary') {
    return <div className="mm-drill-summary">Session complete! Calculating results…</div>;
  }

  return (
    <div className="mm-drill-screen">
      <div className="mm-drill-topbar">
        <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onQuit}>✕ Quit</button>
        <span className="mm-drill-mode">{config.mode}</span>
      </div>

      {config.timerSeconds && phase === 'drilling' && (
        <TimerBar fraction={timer.fraction} remaining={timer.remaining} total={config.timerSeconds} />
      )}

      {currentProblem && phase === 'drilling' && (
        <>
          <ProblemDisplay
            question={currentProblem.question}
            techniqueId={currentProblem.techniqueId}
            problemIndex={problemIndex}
            totalProblems={problems.length}
          />
          <AnswerInput onSubmit={(val) => submitAnswer(val)} disabled={false} />
        </>
      )}

      {phase === 'feedback' && lastResult && (
        <FeedbackBanner result={lastResult} onNext={next} />
      )}
    </div>
  );
}
