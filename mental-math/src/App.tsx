import { useState, useCallback } from 'react';
import { useProgress } from './hooks/useProgress';
import { HomeScreen } from './modes/HomeScreen';
import { FoundationsDrillMode } from './modes/FoundationsDrillMode';
import { TechniqueTrainingMode } from './modes/TechniqueTrainingMode';
import { FlashAnzanScreen } from './components/flashAnzan/FlashAnzanScreen';
import { DashboardScreen } from './components/progress/DashboardScreen';
import { AbacusMode } from './modes/AbacusMode';
import { TimesTablesMode } from './modes/TimesTablesMode';
import { recordResult } from './store/progressStore';
import type { Session } from './types/session';
import type { TechniqueId } from './types/problem';

type AppMode = null | 'foundations' | 'technique' | 'flashAnzan' | 'abacus' | 'tables' | 'progress';

export default function App() {
  const { store, saveSession, unlock } = useProgress();
  const [mode, setMode] = useState<AppMode>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueId | undefined>(undefined);
  const [showAbacus, setShowAbacus] = useState(true);

  function handleSelectMode(m: string, techniqueId?: string) {
    setMode(m as AppMode);
    setSelectedTechnique(techniqueId as TechniqueId | undefined);
  }

  const handleSessionComplete = useCallback((session: Session) => {
    session.results.forEach(r => recordResult(r));
    saveSession(session);
    setMode(null);
  }, [saveSession]);

  if (mode === 'progress') {
    return <div className="mm-app"><DashboardScreen store={store} onBack={() => setMode(null)} /></div>;
  }

  if (mode === 'flashAnzan') {
    return (
      <div className="mm-app">
        <FlashAnzanScreen onBack={() => setMode(null)} showAbacus={showAbacus} />
        <label className="mm-abacus-toggle">
          <input type="checkbox" checked={showAbacus} onChange={e => setShowAbacus(e.target.checked)} />
          Show abacus
        </label>
      </div>
    );
  }

  if (mode === 'abacus') {
    return <div className="mm-app"><AbacusMode onBack={() => setMode(null)} /></div>;
  }

  if (mode === 'tables') {
    return <div className="mm-app"><TimesTablesMode onBack={() => setMode(null)} /></div>;
  }

  if (mode === 'foundations') {
    return (
      <div className="mm-app">
        <FoundationsDrillMode
          onComplete={handleSessionComplete}
          onBack={() => setMode(null)}
        />
      </div>
    );
  }

  if (mode === 'technique') {
    return (
      <div className="mm-app">
        <TechniqueTrainingMode
          initialTechnique={selectedTechnique}
          unlockedTechniques={store.unlockedTechniques}
          onComplete={handleSessionComplete}
          onUnlock={unlock}
          onBack={() => setMode(null)}
        />
      </div>
    );
  }

  return (
    <div className="mm-app">
      <HomeScreen store={store} onSelectMode={handleSelectMode} />
    </div>
  );
}
