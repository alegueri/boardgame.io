import { AbacusView } from './AbacusView';

interface FlashDisplayProps {
  value: number | null;
  showAbacus: boolean;
}

export function FlashDisplay({ value, showAbacus }: FlashDisplayProps) {
  if (value === null) {
    return <div className="mm-flash-blank">…</div>;
  }

  return (
    <div className="mm-flash-display">
      <div className="mm-flash-number">{value}</div>
      {showAbacus && <AbacusView value={value} />}
    </div>
  );
}
