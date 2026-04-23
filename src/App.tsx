import { useEffect, useRef, useState } from 'react';
import { Game } from './game/Game';

function App() {
  const gameRef = useRef<Game | null>(null);
  const [ui, setUi] = useState({ health: 100, ammo: 60, score: 0, won: false });

  useEffect(() => {
    const game = new Game();
    gameRef.current = game;
    game.start();

    const id = window.setInterval(() => {
      if (gameRef.current) setUi(gameRef.current.getUiState());
    }, 100);

    return () => {
      window.clearInterval(id);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="shell">
      <canvas id="gameCanvas" />
      <div className="overlay top-left">
        <div>PIXEL DOOM</div>
        <div className="hint">WASD move, arrows turn, click to lock mouse, space to shoot</div>
      </div>
      <div className="overlay top-right">
        <div>HP {ui.health}</div>
        <div>AMMO {ui.ammo}</div>
        <div>KILLS {ui.score}</div>
      </div>
      <button className="shoot-btn" onClick={() => gameRef.current?.shoot()}>SHOOT</button>
    </div>
  );
}

export default App;
