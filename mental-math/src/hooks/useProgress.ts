import { useState, useCallback } from 'react';
import type { ProgressStore } from '../types/progress';
import type { ProblemResult } from '../types/problem';
import type { Session } from '../types/session';
import type { TechniqueId } from '../types/problem';
import { getStore, recordResult, recordSession, unlockTechnique } from '../store/progressStore';

export function useProgress() {
  const [store, setStore] = useState<ProgressStore>(() => getStore());

  const refresh = useCallback(() => {
    setStore(getStore());
  }, []);

  const saveResult = useCallback((result: ProblemResult) => {
    recordResult(result);
    refresh();
  }, [refresh]);

  const saveSession = useCallback((session: Session) => {
    recordSession(session);
    refresh();
  }, [refresh]);

  const unlock = useCallback((id: TechniqueId) => {
    unlockTechnique(id);
    refresh();
  }, [refresh]);

  return { store, saveResult, saveSession, unlock, refresh };
}
