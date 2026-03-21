import { useState, useRef, useCallback } from 'react';
import type { Problem, ProblemResult } from '../types/problem';
import type { Session, SessionConfig } from '../types/session';

type Phase = 'idle' | 'drilling' | 'feedback' | 'summary';

interface SessionState {
  phase: Phase;
  session: Session | null;
  currentProblem: Problem | null;
  lastResult: ProblemResult | null;
  problemIndex: number;
}

export function useSession(config: SessionConfig, problems: Problem[]) {
  const startTimeRef = useRef<number>(0);
  const [state, setState] = useState<SessionState>({
    phase: 'idle',
    session: null,
    currentProblem: null,
    lastResult: null,
    problemIndex: 0,
  });

  const start = useCallback(() => {
    const session: Session = {
      id: `session-${Date.now()}`,
      config,
      startedAt: Date.now(),
      endedAt: null,
      results: [],
    };
    startTimeRef.current = performance.now();
    setState({
      phase: 'drilling',
      session,
      currentProblem: problems[0] ?? null,
      lastResult: null,
      problemIndex: 0,
    });
  }, [config, problems]);

  const submitAnswer = useCallback((userAnswer: number | null, timedOut = false) => {
    setState(prev => {
      if (!prev.currentProblem || !prev.session) return prev;
      const responseTimeMs = Math.round(performance.now() - startTimeRef.current);
      const wasCorrect = !timedOut && userAnswer === prev.currentProblem.answer;
      const result: ProblemResult = {
        problem: prev.currentProblem,
        userAnswer,
        wasCorrect,
        responseTimeMs,
        timedOut,
        timestamp: Date.now(),
      };
      const updatedSession: Session = {
        ...prev.session,
        results: [...prev.session.results, result],
      };
      return {
        ...prev,
        phase: 'feedback',
        session: updatedSession,
        lastResult: result,
      };
    });
  }, []);

  const next = useCallback(() => {
    setState(prev => {
      if (!prev.session) return prev;
      const nextIndex = prev.problemIndex + 1;
      if (nextIndex >= problems.length) {
        const endedSession = { ...prev.session, endedAt: Date.now() };
        return { ...prev, phase: 'summary', session: endedSession, currentProblem: null };
      }
      startTimeRef.current = performance.now();
      return {
        ...prev,
        phase: 'drilling',
        currentProblem: problems[nextIndex],
        problemIndex: nextIndex,
      };
    });
  }, [problems]);

  const reset = useCallback(() => {
    setState({ phase: 'idle', session: null, currentProblem: null, lastResult: null, problemIndex: 0 });
  }, []);

  return { ...state, start, submitAnswer, next, reset };
}
