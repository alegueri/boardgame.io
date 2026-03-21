import { useState, useMemo } from 'react';
import type { SessionConfig } from '../types/session';
import type { Session } from '../types/session';
import { DrillScreen } from '../components/drill/DrillScreen';
import { additionProblem, multiplicationProblem, subtractionProblem } from '../engine/generators/foundations';

interface FoundationsDrillModeProps {
  onComplete: (session: Session) => void;
  onBack: () => void;
}

type SubMode = 'pick' | 'drilling';
type FoundationType = 'addition' | 'subtraction' | 'multiplication';

export function FoundationsDrillMode({ onComplete, onBack }: FoundationsDrillModeProps) {
  const [subMode, setSubMode] = useState<SubMode>('pick');
  const [type, setType] = useState<FoundationType>('multiplication');
  const [timed, setTimed] = useState(false);

  const config: SessionConfig = useMemo(() => ({
    mode: 'foundations',
    timerSeconds: timed ? 10 : null,
    targetProblemCount: 20,
  }), [timed]);

  const problems = useMemo(() => {
    return Array.from({ length: 20 }, () => {
      if (type === 'addition') return additionProblem();
      if (type === 'subtraction') return subtractionProblem();
      return multiplicationProblem();
    });
  }, [type, subMode]);

  if (subMode === 'pick') {
    return (
      <div className="mm-mode-screen">
        <div className="mm-screen-header">
          <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onBack}>← Back</button>
          <h2>🏗️ Foundations</h2>
        </div>
        <p className="mm-screen-desc">
          Drill the basic facts until they're automatic. Aim for under 1 second per answer.
          Your results are tracked with spaced repetition — facts you struggle with appear more often.
        </p>
        <div className="mm-pick-row">
          {(['addition', 'subtraction', 'multiplication'] as const).map(t => (
            <button
              key={t}
              className={`mm-pick-btn ${type === t ? 'selected' : ''}`}
              onClick={() => setType(t)}
            >
              {t === 'addition' ? '+ Addition' : t === 'subtraction' ? '− Subtraction' : '× Multiplication'}
            </button>
          ))}
        </div>
        <label className="mm-timed-toggle">
          <input type="checkbox" checked={timed} onChange={e => setTimed(e.target.checked)} />
          Timed mode (10s per problem)
        </label>
        <button className="mm-btn mm-btn-primary mm-btn-lg" onClick={() => setSubMode('drilling')}>
          Start Drill →
        </button>
      </div>
    );
  }

  return (
    <DrillScreen
      config={config}
      problems={problems}
      onComplete={onComplete}
      onQuit={() => setSubMode('pick')}
    />
  );
}
