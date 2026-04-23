export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number = 0;
  private lastTime: number = 0;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    // Set canvas size to match display size
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth / dpr;
    this.canvas.height = window.innerHeight / dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    
    // Handle resize
    window.addEventListener('resize', () => {
      const newDpr = window.devicePixelRatio || 1;
      this.canvas.width = window.innerWidth / newDpr;
      this.canvas.height = window.innerHeight / newDpr;
      this.canvas.style.width = `${window.innerWidth}px`;
      this.canvas.style.height = `${window.innerHeight}px`;
    });
  }

  start(gameLoop: (dt: number) => void): void {
    const loop = (time: number) => {
      const dt = time - this.lastTime;
      if (dt >= 16.67) { // ~60fps cap
        gameLoop(dt / 1000);
        this.lastTime = time;
      }
      this.animationId = requestAnimationFrame(loop);
    };
    
    this.lastTime = performance.now();
    loop(this.lastTime);
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}
