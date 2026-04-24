import { useEffect, useRef, useState } from 'react';
import { Game } from './game/Game';

type UiState = {
  health: number;
  ammo: number;
  maxAmmo: number;
  score: number;
  status: 'menu' | 'loading' | 'playing' | 'paused' | 'dead' | 'won';
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

  const titleByState = {
    menu: 'REACTIVE DOOM',
    loading: 'DESCENDING',
    paused: 'PAUSED',
    dead: 'YOU DIED',
    won: 'LEVELS CLEARED',
    playing: 'REACTIVE DOOM',
  } as const;

  const copyByState = {
    menu: 'A compact retro shooter prototype. Push through the exits and survive.',
    loading: 'Generating the next floor.',
    paused: 'Take a breath, then jump back in.',
    dead: 'You got chewed up. Restart and try a tighter route.',
    won: 'You cleared the current build. Nice work.',
    playing: '',
  } as const;

  return (
    <div className="shell">
      <canvas id="gameCanvas" />

      <div className="overlay top-left compact">
        <div>REACTIVE DOOM</div>
        <div className="hint">WASD move, arrows turn, left click shoots, E uses exit door, P or Esc pauses.</div>
      </div>

      <div className="overlay top-right compact">
        <div>LEVEL {ui.level}/{ui.levelCount}</div>
        <div>KILLS {ui.score}</div>
        <div>STATE {ui.status.toUpperCase()}</div>
      </div>

      {ui.status !== 'playing' && (
        <div className="menu-backdrop">
          <div className="menu-panel deluxe">
            <div className="menu-kicker">LEXEREMIN PRESENTS</div>
            <h1 className="menu-title">{titleByState[ui.status]}</h1>
            <p className="menu-copy">{copyByState[ui.status]}</p>

            <div className="menu-actions">
              {ui.status === 'menu' && <button onClick={() => gameRef.current?.startNewGame()}>Start run</button>}
              {ui.status === 'paused' && <button onClick={() => gameRef.current?.resume()}>Resume</button>}
              {(ui.status === 'paused' || ui.status === 'dead' || ui.status === 'won') && (
                <button onClick={() => gameRef.current?.restart()}>Restart</button>
              )}
              {(ui.status === 'paused' || ui.status === 'dead' || ui.status === 'won') && <button onClick={() => gameRef.current?.backToMenu()}>Back to menu</button>}
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
