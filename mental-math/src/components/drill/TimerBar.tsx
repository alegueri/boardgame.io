interface TimerBarProps {
  fraction: number; // 0-1
  remaining: number;
  total: number;
}

export function TimerBar({ fraction, remaining }: TimerBarProps) {
  const color = fraction > 0.5 ? 'var(--mm-green)' : fraction > 0.25 ? 'var(--mm-amber)' : 'var(--mm-red)';
  return (
    <div className="mm-timer-bar-track">
      <div
        className="mm-timer-bar-fill"
        style={{ width: `${Math.max(0, fraction * 100)}%`, background: color }}
      />
      <span className="mm-timer-label">{remaining}s</span>
    </div>
  );
}
