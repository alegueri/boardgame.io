import { useState, useEffect } from 'react';
import { CARDS } from '../game/cards';
import type { CardType } from '../game/types';

interface CardBrowserDrawerProps {
  open: boolean;
  onClose: () => void;
}

type Filter = 'all' | CardType;

const PAGE_SIZE = 8;

export function CardBrowserDrawer({ open, onClose }: CardBrowserDrawerProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(0);

  // Reset to page 0 whenever filter or search changes
  useEffect(() => { setPage(0); }, [filter, search]);

  const filtered = CARDS.filter(card => {
    const matchesType = filter === 'all' || card.type === filter;
    const matchesSearch =
      search.trim() === '' ||
      card.name.toLowerCase().includes(search.toLowerCase()) ||
      card.effect.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <>
      <div
        className={`htp-backdrop ${open ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`cb-drawer ${open ? 'open' : ''}`} aria-label="Card browser">

        {/* Header */}
        <div className="htp-drawer-header">
          <span className="htp-drawer-title">🃏 Cards</span>
          <button className="htp-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Search + filter */}
        <div className="cb-controls">
          <input
            className="cb-search"
            type="search"
            placeholder="Search by name or effect…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="cb-filter-row">
            {(['all', 'keep', 'discard'] as Filter[]).map(f => (
              <button
                key={f}
                className={`cb-filter-btn ${filter === f ? 'cb-filter-btn--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'keep' ? 'Keep' : 'Discard'}
              </button>
            ))}
            <span className="cb-count">{filtered.length} cards</span>
          </div>
        </div>

        {/* Card list */}
        <div className="cb-list">
          {visible.length === 0 ? (
            <p className="cb-empty">No cards match your search.</p>
          ) : (
            visible.map(card => (
              <div key={card.id} className={`cb-row cb-row--${card.type}`}>
                <div className="cb-thumb-wrapper">
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt={card.name} className="cb-thumb" />
                  ) : (
                    <div className="cb-thumb-placeholder">{card.name[0]}</div>
                  )}
                </div>
                <div className="cb-row-info">
                  <div className="cb-row-header">
                    <span className="cb-row-name">{card.name}</span>
                    <span className={`cb-type-pill cb-type-pill--${card.type}`}>
                      {card.type === 'keep' ? 'Keep' : 'Discard'}
                    </span>
                    <span className="cb-row-cost">⚡{card.cost}</span>
                  </div>
                  <p className="cb-row-effect">{card.effect}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="cb-pagination">
            <button
              className="cb-page-btn"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              ← Prev
            </button>
            <span className="cb-page-label">
              {page + 1} / {totalPages}
            </span>
            <button
              className="cb-page-btn"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              Next →
            </button>
          </div>
        )}

      </aside>
    </>
  );
}
