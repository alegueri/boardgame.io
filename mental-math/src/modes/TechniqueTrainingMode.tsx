import { useState, useMemo } from 'react';
import type { SessionConfig, Session } from '../types/session';
import type { TechniqueId } from '../types/problem';
import { TECHNIQUES } from '../constants/techniques';
import { LessonScreen } from '../components/lesson/LessonScreen';
import { DrillScreen } from '../components/drill/DrillScreen';
import {
  times5Problem, times9Problem, times11Problem, times25Problem, times99Problem,
  square5Problem, nearSquareProblem, twoDigitMulProblem, nikhilamProblem, leftToRightProblem,
} from '../engine/generators/techniques';
import type { Problem } from '../types/problem';

function generateProblems(id: TechniqueId, count = 15): Problem[] {
  const gen = () => {
    switch (id) {
      case 'times5': return times5Problem();
      case 'times9': return times9Problem();
      case 'times11': return times11Problem();
      case 'times25': return times25Problem();
      case 'times99': return times99Problem();
      case 'square5': return square5Problem();
      case 'nearSquare': return nearSquareProblem();
      case 'twoDigitMul': return twoDigitMulProblem();
      case 'nikhilam': return nikhilamProblem();
      case 'leftToRight': return leftToRightProblem();
      default: return times9Problem();
    }
  };
  return Array.from({ length: count }, gen);
}

interface TechniqueTrainingModeProps {
  initialTechnique?: TechniqueId;
  unlockedTechniques: TechniqueId[];
  onComplete: (session: Session) => void;
  onUnlock: (id: TechniqueId) => void;
  onBack: () => void;
}

type SubMode = 'pick' | 'lesson' | 'drill';

export function TechniqueTrainingMode({ initialTechnique, unlockedTechniques, onComplete, onUnlock, onBack }: TechniqueTrainingModeProps) {
  const [selected, setSelected] = useState<TechniqueId | null>(initialTechnique ?? null);
  const [subMode, setSubMode] = useState<SubMode>(initialTechnique ? 'lesson' : 'pick');

  const technique = TECHNIQUES.find(t => t.id === selected);

  const config: SessionConfig = useMemo(() => ({
    mode: 'technique',
    techniqueId: selected ?? undefined,
    timerSeconds: null,
    targetProblemCount: 15,
  }), [selected]);

  const problems = useMemo(() => selected ? generateProblems(selected) : [], [selected, subMode]);

  if (subMode === 'pick' || !selected || !technique) {
    return (
      <div className="mm-setup-screen">
        <div className="mm-setup-back">
          <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onBack}>← Back</button>
        </div>
        <div className="mm-setup-hero">
          <div className="mm-setup-icon">🎯</div>
          <h1 className="mm-setup-title">Techniques</h1>
          <p className="mm-setup-desc">
            Shortcuts from Arthur Benjamin & Vedic math. Each unlocks with a quick lesson first.
          </p>
        </div>
        <div className="mm-technique-list">
          {TECHNIQUES.filter(t => t.id !== 'foundations').map(t => {
            const unlocked = unlockedTechniques.includes(t.id);
            return (
              <button
                key={t.id}
                className={`mm-technique-row ${unlocked ? 'unlocked' : 'locked'}`}
                onClick={() => { setSelected(t.id); setSubMode('lesson'); }}
              >
                <span className="mm-technique-emoji">{t.emoji}</span>
                <div className="mm-technique-info">
                  <span className="mm-technique-title">{t.title}</span>
                  <span className="mm-technique-sub">{t.subtitle}</span>
                </div>
                <div className="mm-technique-meta">
                  {'⭐'.repeat(t.difficulty)}
                  {!unlocked && <span>🔒</span>}
                </div>
                <span className="mm-technique-chevron">›</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (subMode === 'lesson') {
    if (technique.lessonSteps.length === 0) {
      onUnlock(selected);
      setSubMode('drill');
      return null;
    }
    return (
      <LessonScreen
        technique={technique}
        onComplete={() => { onUnlock(selected); setSubMode('drill'); }}
        onBack={() => setSubMode('pick')}
      />
    );
  }

  return (
    <DrillScreen
      config={config}
      problems={problems}
      onComplete={onComplete}
      onQuit={() => setSubMode('pick')}
      glowColor="rgba(191,90,242,0.13)"
    />
  );
}
