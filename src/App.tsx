import { useEffect, useRef, useState } from 'react';
import { Game } from './game/Game';

type UiState = {
  health: number;
  ammo: number;
  maxAmmo: number;
  score: number;
  status: 'menu' | 'playing' | 'paused' | 'dead' | 'won';
  hasKey: boolean;
  message: string;
  level: number;
  levelCount: number;
};

function App() {
  const gameRef = useRef<Game | null>(null);
  const [ui, setUi] = useState<UiState>({ health: 100, ammo: 60, maxAmmo: 120, score: 0, status: 'menu', hasKey: false, message: '', level: 1, levelCount: 2 });

  useEffect(() => {
    const sync = () => {
      if (gameRef.current) setUi(gameRef.current.getUiState());
    };

    const game = new Game(sync);
    gameRef.current = game;
    game.start();
    sync();

    const id = window.setInterval(sync, 100);
    return () => {
      window.clearInterval(id);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="shell">
      <canvas id="gameCanvas" />

      <div className="overlay top-left">
        <div>REACTIVE DOOM</div>
        <div className="hint">WASD move, arrows turn, click to lock mouse, left click shoots, E uses the exit door, P or Esc pauses. Green packs heal, yellow packs give ammo, gold key opens the level exit.</div>
      </div>

      <div className="overlay top-right">
        <div>LEVEL {ui.level}/{ui.levelCount}</div>
        <div>HP {ui.health}</div>
        <div>AMMO {ui.ammo}/{ui.maxAmmo}</div>
        <div>KILLS {ui.score}</div>
        <div>KEY {ui.hasKey ? 'YES' : 'NO'}</div>
        <div>STATE {ui.status.toUpperCase()}</div>
      </div>

      <button className="shoot-btn" onClick={() => gameRef.current?.shoot()} disabled={ui.status !== 'playing'}>
        SHOOT
      </button>

      {ui.status !== 'playing' && (
        <div className="menu-backdrop">
          <div className="menu-panel">
            <h1 className="menu-title">REACTIVE DOOM</h1>

            {ui.status === 'menu' && <p className="menu-copy">Start a run and clear the room.</p>}
            {ui.status === 'paused' && <p className="menu-copy">Game paused.</p>}
            {ui.status === 'dead' && <p className="menu-copy">You died. Start again.</p>}
            {ui.status === 'won' && <p className="menu-copy">All enemies cleared. Nice.</p>}

            <div className="menu-actions">
              {ui.status === 'menu' && <button onClick={() => gameRef.current?.startNewGame()}>Start game</button>}
              {ui.status === 'paused' && <button onClick={() => gameRef.current?.resume()}>Resume</button>}
              {(ui.status === 'paused' || ui.status === 'dead' || ui.status === 'won') && (
                <button onClick={() => gameRef.current?.restart()}>Restart</button>
              )}
              {(ui.status === 'paused' || ui.status === 'dead' || ui.status === 'won') && <button onClick={() => gameRef.current?.backToMenu()}>Menu</button>}
            </div>

            <div className="menu-help">
              <div>Enter starts a new run</div>
              <div>Left click shoots when mouse is locked</div>
              <div>E uses the exit door in front of you</div>
              <div>P or Esc toggles pause while playing</div>
            </div>

            <a className="menu-github" href="https://github.com/lexeremin" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.29 9.4 7.86 10.92.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.69 1.26 3.35.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.3 1.19-3.11-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.19a11 11 0 0 1 5.79 0c2.2-1.5 3.17-1.19 3.17-1.19.63 1.59.23 2.77.11 3.06.74.81 1.19 1.85 1.19 3.11 0 4.42-2.69 5.4-5.25 5.68.41.35.78 1.04.78 2.1 0 1.52-.01 2.74-.01 3.11 0 .31.21.68.8.56a11.53 11.53 0 0 0 7.84-10.92C23.5 5.66 18.35.5 12 .5Z"/>
              </svg>
              <span>@lexeremin</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
