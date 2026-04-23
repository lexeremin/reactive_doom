import { useEffect, useRef, useState } from 'react';
import { Game } from './game/Game';

type UiState = {
  health: number;
  ammo: number;
  maxAmmo: number;
  score: number;
  status: 'menu' | 'playing' | 'paused' | 'dead' | 'won';
};

function App() {
  const gameRef = useRef<Game | null>(null);
  const [ui, setUi] = useState<UiState>({ health: 100, ammo: 60, maxAmmo: 120, score: 0, status: 'menu' });

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
        <div className="hint">WASD move, arrows turn, click to lock mouse, left click shoots, P or Esc pauses. Green packs heal, yellow packs give ammo.</div>
      </div>

      <div className="overlay top-right">
        <div>HP {ui.health}</div>
        <div>AMMO {ui.ammo}/{ui.maxAmmo}</div>
        <div>KILLS {ui.score}</div>
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
              <div>P or Esc toggles pause while playing</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
