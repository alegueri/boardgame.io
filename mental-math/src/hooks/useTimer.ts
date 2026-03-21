import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(seconds: number | null, onExpire: () => void) {
  const [remaining, setRemaining] = useState<number>(seconds ?? 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const start = useCallback(() => {
    if (!seconds) return;
    setRemaining(seconds);
    activeRef.current = true;
    const endTime = Date.now() + seconds * 1000;
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, endTime - Date.now());
      setRemaining(Math.ceil(left / 1000));
      if (left <= 0 && activeRef.current) {
        activeRef.current = false;
        if (intervalRef.current) clearInterval(intervalRef.current);
        onExpireRef.current();
      }
    }, 100);
  }, [seconds]);

  const stop = useCallback(() => {
    activeRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const fraction = seconds ? remaining / seconds : 1;

  return { remaining, fraction, start, stop };
}
