import type { ProgressStore } from '../types/progress';
import { TECHNIQUES } from '../constants/techniques';

type Mode = 'foundations' | 'technique' | 'flashAnzan' | 'abacus' | 'progress';

interface HomeScreenProps {
  store: ProgressStore;
  onSelectMode: (mode: Mode, techniqueId?: string) => void;
}

export function HomeScreen({ store, onSelectMode }: HomeScreenProps) {
  const today = new Date().toISOString().slice(0, 10);
  const todayStats = store.dailyStats[today];
  const todayCount = todayStats?.problemsSolved ?? 0;
  const dailyGoal = 30;

  return (
    <div className="mm-home">
      <div className="mm-home-header">
        <div className="mm-home-title">
          <h1>🧮 Mental Math Trainer</h1>
          <p className="mm-home-subtitle">Build real speed. One session at a time.</p>
        </div>
        <div className="mm-home-streak">
          <span className="mm-streak-fire">🔥</span>
          <span className="mm-streak-count">{store.streak}</span>
          <span className="mm-streak-label">day streak</span>
        </div>
      </div>

      <div className="mm-daily-progress">
        <div className="mm-daily-progress-label">
          Today: {todayCount} / {dailyGoal} problems
        </div>
        <div className="mm-daily-bar-track">
          <div
            className="mm-daily-bar-fill"
            style={{ width: `${Math.min(100, (todayCount / dailyGoal) * 100)}%` }}
          />
        </div>
      </div>

      <div className="mm-mode-grid">
        <button className="mm-mode-card mm-mode-foundations" onClick={() => onSelectMode('foundations')}>
          <div className="mm-mode-emoji">🏗️</div>
          <div className="mm-mode-title">Foundations</div>
          <div className="mm-mode-desc">Automate basic facts with spaced repetition</div>
        </button>

        <button className="mm-mode-card mm-mode-flash" onClick={() => onSelectMode('flashAnzan')}>
          <div className="mm-mode-emoji">⚡</div>
          <div className="mm-mode-title">Flash Anzan</div>
          <div className="mm-mode-desc">Soroban abacus speed training</div>
        </button>

        <button className="mm-mode-card mm-mode-mixed" onClick={() => onSelectMode('technique')}>
          <div className="mm-mode-emoji">🎯</div>
          <div className="mm-mode-title">Techniques</div>
          <div className="mm-mode-desc">Arthur Benjamin's shortcuts & Vedic math</div>
        </button>

        <button className="mm-mode-card mm-mode-abacus" onClick={() => onSelectMode('abacus')}>
          <div className="mm-mode-emoji">🧮</div>
          <div className="mm-mode-title">Abacus</div>
          <div className="mm-mode-desc">Soroban drills, Anzan & Chisanbop finger math</div>
        </button>

        <button className="mm-mode-card mm-mode-progress" onClick={() => onSelectMode('progress')} style={{ gridColumn: '1 / -1' }}>
          <div className="mm-mode-emoji">📊</div>
          <div className="mm-mode-title">Progress</div>
          <div className="mm-mode-desc">Track your speed, accuracy & streaks</div>
        </button>
      </div>

      <div className="mm-technique-section">
        <h3>Techniques</h3>
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
                  {!unlocked && <span className="mm-lock">🔒</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
