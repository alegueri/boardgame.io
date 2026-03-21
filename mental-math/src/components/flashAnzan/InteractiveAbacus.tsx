import { useState, useCallback, useImperativeHandle, forwardRef } from 'react';

export interface InteractiveAbacusHandle {
  getValue: () => number;
  reset: () => void;
}

interface ColState {
  heaven: boolean;
  earth: [boolean, boolean, boolean, boolean];
}

function emptyCol(): ColState {
  return { heaven: false, earth: [false, false, false, false] };
}

function colValue(col: ColState): number {
  return (col.heaven ? 5 : 0) + col.earth.filter(Boolean).length;
}

function totalValue(cols: ColState[]): number {
  return cols.reduce((sum, col, i) => sum + colValue(col) * Math.pow(10, i), 0);
}

const PLACE_LABELS = ['1s', '10s', '100s', '1000s'];

interface InteractiveAbacusProps {
  numColumns?: number;
  onValueChange?: (value: number) => void;
}

export const InteractiveAbacus = forwardRef<InteractiveAbacusHandle, InteractiveAbacusProps>(
  ({ numColumns = 4, onValueChange }, ref) => {
    const [cols, setCols] = useState<ColState[]>(() =>
      Array.from({ length: numColumns }, emptyCol)
    );

    useImperativeHandle(ref, () => ({
      getValue: () => totalValue(cols),
      reset: () => setCols(Array.from({ length: numColumns }, emptyCol)),
    }));

    const toggleHeaven = useCallback((colIdx: number) => {
      setCols(prev => {
        const next = prev.map((c, i) => i === colIdx ? { ...c, heaven: !c.heaven } : c);
        onValueChange?.(totalValue(next));
        return next;
      });
    }, [onValueChange]);

    const toggleEarth = useCallback((colIdx: number, beadIdx: number) => {
      setCols(prev => {
        const next = prev.map((c, i) => {
          if (i !== colIdx) return c;
          const earth = [...c.earth] as ColState['earth'];
          earth[beadIdx] = !earth[beadIdx];
          return { ...c, earth };
        });
        onValueChange?.(totalValue(next));
        return next;
      });
    }, [onValueChange]);

    // Display: highest place value first (rightmost col in state = ones)
    const displayCols = [...cols].reverse();
    const displayLabels = [...PLACE_LABELS.slice(0, numColumns)].reverse();

    const value = totalValue(cols);

    return (
      <div className="mm-iabacus">
        <div className="mm-iabacus-frame">
          {displayCols.map((col, displayIdx) => {
            const colIdx = cols.length - 1 - displayIdx; // map back to state index
            return (
              <div key={colIdx} className="mm-iabacus-col">
                {/* Heaven section */}
                <div className="mm-iabacus-heaven">
                  <button
                    className={`mm-iabacus-bead mm-iabacus-heaven-bead ${col.heaven ? 'active' : ''}`}
                    onClick={() => toggleHeaven(colIdx)}
                    title={`${col.heaven ? 'Deactivate' : 'Activate'} heaven bead (worth 5)`}
                  />
                </div>

                {/* Divider rod */}
                <div className="mm-iabacus-divider" />

                {/* Earth section — bead[0] is closest to divider */}
                <div className="mm-iabacus-earth">
                  {col.earth.map((active, beadIdx) => (
                    <button
                      key={beadIdx}
                      className={`mm-iabacus-bead mm-iabacus-earth-bead ${active ? 'active' : ''}`}
                      onClick={() => toggleEarth(colIdx, beadIdx)}
                      title={`Earth bead (worth 1)`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Column labels */}
        <div className="mm-iabacus-labels">
          {displayLabels.map((label, i) => (
            <div key={i} className="mm-iabacus-label">{label}</div>
          ))}
        </div>

        <div className="mm-iabacus-value-display">{value}</div>

        <button
          className="mm-btn mm-btn-ghost mm-btn-sm mm-iabacus-reset"
          onClick={() => {
            setCols(Array.from({ length: numColumns }, emptyCol));
            onValueChange?.(0);
          }}
        >
          Clear
        </button>
      </div>
    );
  }
);
InteractiveAbacus.displayName = 'InteractiveAbacus';
