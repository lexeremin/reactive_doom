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
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
