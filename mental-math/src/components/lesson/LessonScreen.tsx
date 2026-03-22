import { useState } from 'react';
import type { TechniqueInfo } from '../../constants/techniques';

interface LessonScreenProps {
  technique: TechniqueInfo;
  onComplete: () => void;
  onBack: () => void;
}

export function LessonScreen({ technique, onComplete, onBack }: LessonScreenProps) {
  const [step, setStep] = useState(0);
  const steps = technique.lessonSteps;
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const pct = ((step + 1) / steps.length) * 100;

  if (steps.length === 0) {
    onComplete();
    return null;
  }

  return (
    <div className="mm-lesson-screen">
      {/* Top bar */}
      <div className="mm-lesson-topbar">
        <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onBack}>← Back</button>
        <span className="mm-lesson-technique">{technique.emoji} {technique.title}</span>
        <span className="mm-lesson-step-counter">{step + 1} / {steps.length}</span>
      </div>

      {/* Progress bar */}
      <div className="mm-lesson-progress-track">
        <div className="mm-lesson-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* Step dots */}
      <div className="mm-lesson-dots">
        {steps.map((_, i) => (
          <button
            key={i}
            className={`mm-lesson-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
            onClick={() => i <= step && setStep(i)}
          />
        ))}
      </div>

      {/* Content card */}
      <div className="mm-lesson-card">
        <h2 className="mm-lesson-title">{current.title}</h2>
        <p className="mm-lesson-explanation">{current.explanation}</p>

        <div className="mm-lesson-example">
          <div className="mm-lesson-example-label">Example</div>
          <div className="mm-lesson-example-problem">{current.example}</div>
          <div className="mm-lesson-steps">
            {current.steps.map((s, i) => (
              <div key={i} className="mm-lesson-step">
                <span className="mm-lesson-step-num">{i + 1}</span>
                <span className="mm-lesson-step-text">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mm-lesson-actions">
        {step > 0 && (
          <button className="mm-btn mm-btn-ghost" onClick={() => setStep(s => s - 1)}>← Prev</button>
        )}
        {isLast ? (
          <button className="mm-btn mm-btn-primary mm-btn-lg" onClick={onComplete}>
            Start Practicing →
          </button>
        ) : (
          <button className="mm-btn mm-btn-primary mm-btn-lg" onClick={() => setStep(s => s + 1)}>
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
