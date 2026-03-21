import { numberToAbacusState } from '../../engine/abacus';
import { AbacusColumnView } from './AbacusColumn';

interface AbacusViewProps {
  value: number;
  minColumns?: number;
}

export function AbacusView({ value, minColumns = 4 }: AbacusViewProps) {
  const state = numberToAbacusState(value);
  const cols = [...state.columns];
  while (cols.length < minColumns) {
    cols.push({
      heavenBead: { active: false },
      earthBeads: [{ active: false }, { active: false }, { active: false }, { active: false }],
      placeValue: Math.pow(10, cols.length),
    });
  }
  const displayCols = [...cols].reverse(); // show highest place value first

  return (
    <div className="mm-abacus">
      <div className="mm-abacus-frame">
        {displayCols.map((col, i) => (
          <AbacusColumnView key={i} column={col} />
        ))}
      </div>
      <div className="mm-abacus-value">{value}</div>
    </div>
  );
}
