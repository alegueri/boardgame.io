import type { AbacusColumn as AbacusColumnType } from '../../types/abacus';

interface AbacusColumnProps {
  column: AbacusColumnType;
}

export function AbacusColumnView({ column }: AbacusColumnProps) {
  return (
    <div className="mm-abacus-column">
      <div className="mm-abacus-heaven">
        <div className={`mm-abacus-bead mm-abacus-heaven-bead ${column.heavenBead.active ? 'active' : ''}`} />
      </div>
      <div className="mm-abacus-divider" />
      <div className="mm-abacus-earth">
        {[...column.earthBeads].reverse().map((bead, i) => (
          <div key={i} className={`mm-abacus-bead mm-abacus-earth-bead ${bead.active ? 'active' : ''}`} />
        ))}
      </div>
    </div>
  );
}
