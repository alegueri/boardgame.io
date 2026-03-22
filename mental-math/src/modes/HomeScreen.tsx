import type { ProgressStore } from '../types/progress';
import { TECHNIQUES } from '../constants/techniques';

type Mode = 'foundations' | 'technique' | 'flashAnzan' | 'abacus' | 'tables' | 'progress';

interface HomeScreenProps {
  store: ProgressStore;
  onSelectMode: (mode: Mode, techniqueId?: string) => void;
}

const MODES: { mode: Mode; emoji: string; title: string; desc: string; cls: string }[] = [
  { mode: 'foundations', emoji: '🏗️', title: 'Foundations',  desc: 'Basic facts + spaced repetition', cls: 'mm-mode-foundations' },
  { mode: 'tables',      emoji: '✖️', title: 'Times Tables', desc: 'Any combo, cutoff timer',         cls: 'mm-mode-tables'      },
  { mode: 'flashAnzan',  emoji: '⚡', title: 'Flash Anzan',  desc: 'Soroban speed training',          cls: 'mm-mode-flash'       },
  { mode: 'technique',   emoji: '🎯', title: 'Techniques',   desc: 'Benjamin & Vedic shortcuts',      cls: 'mm-mode-techniques'  },
  { mode: 'abacus',      emoji: '🧮', title: 'Abacus',       desc: 'Soroban, Anzan & Chisanbop',      cls: 'mm-mode-abacus'      },
  { mode: 'progress',    emoji: '📊', title: 'Progress',     desc: 'Streaks, speed & accuracy',       cls: 'mm-mode-progress'    },
];

export function HomeScreen({ store, onSelectMode }: HomeScreenProps) {
  const today      = new Date().toISOString().slice(0, 10);
  const todayCount = store.dailyStats[today]?.problemsSolved ?? 0;
  const dailyGoal  = 30;
  const pct        = Math.min(100, (todayCount / dailyGoal) * 100);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mm-home">
      {/* Hero */}
      <div className="mm-hero">
        <div className="mm-hero-tag">Train Your Mind</div>
        <h1>Mental<br/>Math</h1>
        <p className="mm-hero-sub">{greeting}. Ready to get faster?</p>
      </div>

      {/* Streak + daily progress */}
      <div className="mm-today-card">
        <div className="mm-today-top">
          <div className="mm-today-streak">
            <span className="mm-streak-fire">🔥</span>
            <span className="mm-streak-num">{store.streak}</span>
            <span className="mm-streak-label">day streak</span>
          </div>
          <span className="mm-today-count">{todayCount} / {dailyGoal} today</span>
        </div>
        <div className="mm-today-bar-track">
          <div className="mm-today-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Mode cards */}
      <div>
        <div className="mm-section-label" style={{ marginBottom: '0.65rem' }}>Train</div>
        <div className="mm-mode-grid">
          {MODES.map(({ mode, emoji, title, desc, cls }) => (
            <button key={mode} className={`mm-mode-card ${cls}`} onClick={() => onSelectMode(mode)}>
              <div className="mm-mode-icon">{emoji}</div>
              <div className="mm-mode-label">
                <div className="mm-mode-title">{title}</div>
                <div className="mm-mode-desc">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Technique list */}
      <div>
        <div className="mm-section-label" style={{ marginBottom: '0.65rem' }}>Techniques</div>
        <div className="mm-technique-list">
          {TECHNIQUES.filter(t => t.id !== 'foundations').map(t => {
            const unlocked = store.unlockedTechniques.includes(t.id);
            return (
              <button
                key={t.id}
                className={`mm-technique-row ${unlocked ? 'unlocked' : 'locked'}`}
                onClick={() => onSelectMode('technique', t.id)}
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
    </div>
  );
}
