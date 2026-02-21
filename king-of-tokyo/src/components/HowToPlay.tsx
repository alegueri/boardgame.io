export const HOW_TO_PLAY_ITEMS = [
  {
    icon: '🎲',
    title: 'Roll the Dice',
    text: 'Roll 6 dice up to 3 times per turn. Click a die to keep it between rolls — Yahtzee style.',
  },
  {
    icon: '🐾',
    title: 'Claws = Damage',
    text: 'Each claw deals 1 damage to opponents. From outside Tokyo you hit the occupant; from inside you hit everyone outside.',
  },
  {
    icon: '❤️',
    title: 'Hearts = Healing',
    text: 'Each heart restores 1 HP — but only while outside Tokyo. Max HP is 10.',
  },
  {
    icon: '⚡',
    title: 'Lightning = Energy',
    text: 'Collect energy cubes to spend on Power Cards. Buy from the 3-card market on your turn after rolling. Pay 2⚡ to sweep and reveal 3 new cards. Browse all 64 cards with the 🃏 Cards button.',
  },
  {
    icon: '①②③',
    title: 'Numbers = Victory Points',
    text: '3-of-a-kind scores that number in VP. Each extra matching die adds +1 VP. (e.g. four 3s = 4 VP)',
  },
  {
    icon: '🏙️',
    title: 'Tokyo',
    text: "Enter Tokyo when it's empty and gain +1 VP. Start each turn there for +2 VP. When attacked, choose to yield (flee) or stay and take the damage.",
  },
  {
    icon: '🏆',
    title: 'Win Condition',
    text: 'First to 20 VP wins — or be the last monster standing!',
  },
] as const;

// ── Inline grid (used on the start screen) ────────────────────────────────────

export function HowToPlayGrid() {
  return (
    <section className="how-to-play">
      <h2>How to Play</h2>
      <div className="htp-grid">
        {HOW_TO_PLAY_ITEMS.map(({ icon, title, text }) => (
          <div key={title} className="htp-card">
            <div className="htp-icon">{icon}</div>
            <div className="htp-body">
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Slide-in drawer (used during gameplay) ────────────────────────────────────

interface DrawerProps {
  open: boolean;
  onClose: () => void;
}

export function HowToPlayDrawer({ open, onClose }: DrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`htp-backdrop ${open ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside className={`htp-drawer ${open ? 'open' : ''}`} aria-label="How to play">
        <div className="htp-drawer-header">
          <span className="htp-drawer-title">📖 How to Play</span>
          <button className="htp-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="htp-drawer-body">
          {HOW_TO_PLAY_ITEMS.map(({ icon, title, text }) => (
            <div key={title} className="htp-card">
              <div className="htp-icon">{icon}</div>
              <div className="htp-body">
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
