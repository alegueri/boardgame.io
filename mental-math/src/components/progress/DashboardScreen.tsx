import type { ProgressStore } from '../../types/progress';
import { getAvgResponseTime } from '../../store/progressStore';

interface DashboardScreenProps {
  store: ProgressStore;
  onBack: () => void;
}

export function DashboardScreen({ store, onBack }: DashboardScreenProps) {
  const totalSessions = store.sessions.length;
  const totalProblems = store.sessions.reduce((s, sess) => s + sess.results.length, 0);
  const totalCorrect = store.sessions.reduce((s, sess) => s + sess.results.filter(r => r.wasCorrect).length, 0);
  const accuracy = totalProblems > 0 ? Math.round((totalCorrect / totalProblems) * 100) : 0;

  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const masteredFacts = Object.values(store.facts).filter(f => f.srsCard.repetitions >= 3 && f.totalAttempts >= 5);

  return (
    <div className="mm-dashboard">
      <div className="mm-screen-header">
        <button className="mm-btn mm-btn-ghost mm-btn-sm" onClick={onBack}>← Back</button>
        <h2>📊 Progress</h2>
      </div>

      <div className="mm-stats-grid">
        <div className="mm-stat-card">
          <div className="mm-stat-value">{store.streak}</div>
          <div className="mm-stat-label">🔥 Day Streak</div>
        </div>
        <div className="mm-stat-card">
          <div className="mm-stat-value">{totalSessions}</div>
          <div className="mm-stat-label">Sessions</div>
        </div>
        <div className="mm-stat-card">
          <div className="mm-stat-value">{totalProblems}</div>
          <div className="mm-stat-label">Problems</div>
        </div>
        <div className="mm-stat-card">
          <div className="mm-stat-value">{accuracy}%</div>
          <div className="mm-stat-label">Accuracy</div>
        </div>
        <div className="mm-stat-card">
          <div className="mm-stat-value">{masteredFacts.length}</div>
          <div className="mm-stat-label">Facts Mastered</div>
        </div>
      </div>

      <div className="mm-dashboard-section">
        <h3>Last 7 Days</h3>
        <div className="mm-week-chart">
          {recentDays.map(day => {
            const stats = store.dailyStats[day];
            const count = stats?.problemsSolved ?? 0;
            const maxCount = 50;
            return (
              <div key={day} className="mm-week-day">
                <div className="mm-week-bar-track">
                  <div
                    className="mm-week-bar-fill"
                    style={{ height: `${Math.min(100, (count / maxCount) * 100)}%` }}
                  />
                </div>
                <span className="mm-week-label">{day.slice(5)}</span>
                <span className="mm-week-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mm-dashboard-section">
        <h3>Unlocked Techniques</h3>
        <div className="mm-unlocked-list">
          {store.unlockedTechniques.map(id => (
            <span key={id} className="mm-unlocked-badge">{id}</span>
          ))}
        </div>
      </div>

      {Object.values(store.facts).length > 0 && (
        <div className="mm-dashboard-section">
          <h3>Slowest Facts (avg response time)</h3>
          <div className="mm-slow-facts">
            {Object.values(store.facts)
              .filter(f => f.totalAttempts >= 3)
              .sort((a, b) => (getAvgResponseTime(b) ?? 0) - (getAvgResponseTime(a) ?? 0))
              .slice(0, 5)
              .map(f => (
                <div key={f.cardId} className="mm-slow-fact">
                  <span className="mm-slow-fact-id">{f.cardId}</span>
                  <span className="mm-slow-fact-time">{((getAvgResponseTime(f) ?? 0) / 1000).toFixed(2)}s</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
