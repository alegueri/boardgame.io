import { useState, useMemo } from 'react';
import type React from 'react';
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
    const ops = [
      { id: 'addition',       icon: '＋', label: 'Addition',       color: 'var(--green)'  },
      { id: 'subtraction',    icon: '－', label: 'Subtraction',    color: 'var(--red)'    },
      { id: 'multiplication', icon: '✕',  label: 'Multiplication', color: 'var(--blue)'   },
    ] as const;
    return (
      <div className="mm-setup-screen">
        <div className="mm-setup-back">
          <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onBack}>← Back</button>
        </div>
        <div className="mm-setup-hero">
          <div className="mm-setup-icon">🏗️</div>
          <h1 className="mm-setup-title">Foundations</h1>
          <p className="mm-setup-desc">
            Drill until every fact is instant. Spaced repetition surfaces the ones you struggle with most.
          </p>
        </div>
        <div className="mm-op-grid">
          {ops.map(op => (
            <button
              key={op.id}
              className={`mm-op-card ${type === op.id ? 'selected' : ''}`}
              style={{ '--op-color': op.color } as React.CSSProperties}
              onClick={() => setType(op.id)}
            >
              <span className="mm-op-icon">{op.icon}</span>
              <span className="mm-op-label">{op.label}</span>
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
      glowColor="rgba(48,209,88,0.13)"
    />
  );
}
