import { GameEngine } from './engine';
import { Raycaster } from './raycaster';
import { Player } from './player';
import { Enemy } from './enemy';
import { Weapon } from './weapon';
import { MAP, getMapDimensions } from './map';

const WALL_COLORS: Record<number, string> = {
  1: '#78624a',
  2: '#4e7a61',
  3: '#7a4f4f',
};

type GameStatus = 'menu' | 'playing' | 'paused' | 'dead' | 'won';

export class Game {
  private engine: GameEngine;
  private raycaster: Raycaster;
  private player!: Player;
  private enemies: Enemy[] = [];
  private weapon!: Weapon;
  private keys: Record<string, boolean> = {};
  private lastShotFlash = 0;
  private score = 0;
  private status: GameStatus = 'menu';
  private onStateChange?: () => void;

  constructor(onStateChange?: () => void) {
    this.engine = new GameEngine('gameCanvas');
    this.raycaster = new Raycaster(MAP, getMapDimensions(MAP).width, getMapDimensions(MAP).height);
    this.onStateChange = onStateChange;
    this.resetWorld();
    this.setupInput();
  }

  private resetWorld() {
    this.player = new Player(1.5, 1.5, 0.1);
    this.weapon = new Weapon();
    this.score = 0;
    this.lastShotFlash = 0;
    this.enemies = [
      new Enemy(7.5, 3.5, 'imp'),
      new Enemy(10.5, 8.5, 'demon'),
      new Enemy(4.5, 10.5, 'soldier'),
      new Enemy(11.5, 3.5, 'imp'),
      new Enemy(12.5, 11.5, 'soldier'),
    ];
  }

  private emitStateChange() {
    this.onStateChange?.();
  }

  private setupInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;

      if (e.code === 'Space') {
        if (this.status === 'playing') this.shoot();
      }

      if (e.key === 'Escape') {
        if (this.status === 'playing') this.pause();
        else if (this.status === 'paused') this.resume();
      }

      if (e.key.toLowerCase() === 'p') {
        if (this.status === 'playing') this.pause();
        else if (this.status === 'paused') this.resume();
      }

      if (e.key.toLowerCase() === 'enter') {
        if (this.status === 'menu' || this.status === 'dead' || this.status === 'won') {
          this.startNewGame();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    const canvas = this.engine.getCanvas();
    canvas.addEventListener('click', () => {
      if (this.status === 'playing') canvas.requestPointerLock?.();
    });

    document.addEventListener('mousemove', (e) => {
      if (this.status !== 'playing') return;
      if (document.pointerLockElement === canvas) {
        this.player.updateAngle(e.movementX * 0.0025);
      }
    });
  }

  start() {
    this.engine.start((dt) => {
      this.update(dt);
      this.render();
    });
  }

  startNewGame() {
    this.resetWorld();
    this.status = 'playing';
    this.engine.getCanvas().requestPointerLock?.();
    this.emitStateChange();
  }

  pause() {
    if (this.status === 'menu') return;
    this.status = 'paused';
    document.exitPointerLock?.();
    this.emitStateChange();
  }

  resume() {
    if (this.status !== 'paused') return;
    this.status = 'playing';
    this.engine.getCanvas().requestPointerLock?.();
    this.emitStateChange();
  }

  restart() {
    this.startNewGame();
  }

  backToMenu() {
    this.resetWorld();
    this.status = 'menu';
    document.exitPointerLock?.();
    this.emitStateChange();
  }

  private update(dt: number) {
    if (this.status !== 'playing') return;

    this.player.update(dt, this.keys, MAP);
    this.lastShotFlash = Math.max(0, this.lastShotFlash - dt * 4);

    for (const enemy of this.enemies) {
      const damage = enemy.update(dt, this.player.getX(), this.player.getY(), MAP);
      if (damage > 0) this.player.damage(damage);
    }

    if (this.player.getHealth() <= 0) {
      this.status = 'dead';
      document.exitPointerLock?.();
      this.emitStateChange();
      return;
    }

    if (this.enemies.every((enemy) => !enemy.isAlive())) {
      this.status = 'won';
      document.exitPointerLock?.();
      this.emitStateChange();
    }
  }

  private render() {
    const canvas = this.engine.getCanvas();
    const ctx = this.engine.getContext();
    const width = canvas.width;
    const height = canvas.height;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);

    const sky = ctx.createLinearGradient(0, 0, 0, height / 2);
    sky.addColorStop(0, '#221a24');
    sky.addColorStop(1, '#4f394c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height / 2);

    const floor = ctx.createLinearGradient(0, height / 2, 0, height);
    floor.addColorStop(0, '#41352d');
    floor.addColorStop(1, '#161210');
    ctx.fillStyle = floor;
    ctx.fillRect(0, height / 2, width, height / 2);

    const fov = Math.PI / 3;
    const rays = Math.min(320, Math.floor(width / 2));
    const zBuffer: number[] = [];

    for (let i = 0; i < rays; i++) {
      const rayAngle = this.player.getAngle() - fov / 2 + (i / rays) * fov;
      const hit = this.raycaster.castRay(this.player.getX(), this.player.getY(), rayAngle, 24);
      const corrected = hit.distance * Math.cos(rayAngle - this.player.getAngle());
      zBuffer[i] = corrected;

      const wallHeight = Math.min(height, height / Math.max(corrected, 0.0001));
      const x = (i / rays) * width;
      const colW = width / rays + 1;
      const top = (height - wallHeight) / 2;
      const shade = Math.max(0.28, 1 - corrected / 12) * (hit.side === 1 ? 0.82 : 1);
      const color = WALL_COLORS[MAP[Math.floor(hit.hitY)]?.[Math.floor(hit.hitX)] || 1];

      ctx.fillStyle = this.shadeColor(color, shade);
      ctx.fillRect(x, top, colW, wallHeight);
      ctx.fillStyle = `rgba(0,0,0,${Math.min(0.7, corrected / 18)})`;
      ctx.fillRect(x, top, colW, wallHeight);
    }

    this.renderSprites(ctx, width, height, zBuffer, rays, fov);
    this.renderWeapon(ctx, width, height);
    this.renderHud(ctx, width, height);
  }

  private renderSprites(ctx: CanvasRenderingContext2D, width: number, height: number, zBuffer: number[], rays: number, fov: number) {
    const sprites = this.enemies
      .filter((enemy) => enemy.isAlive())
      .map((enemy) => {
        const dx = enemy.getX() - this.player.getX();
        const dy = enemy.getY() - this.player.getY();
        const distance = Math.hypot(dx, dy);
        const angleToEnemy = Math.atan2(dy, dx);
        let relative = angleToEnemy - this.player.getAngle();
        while (relative > Math.PI) relative -= Math.PI * 2;
        while (relative < -Math.PI) relative += Math.PI * 2;
        return { enemy, distance, relative };
      })
      .filter((s) => Math.abs(s.relative) < fov * 0.8)
      .sort((a, b) => b.distance - a.distance);

    for (const sprite of sprites) {
      const screenX = ((sprite.relative + fov / 2) / fov) * width;
      const size = Math.max(18, Math.min(height * 0.6, height / sprite.distance));
      const left = screenX - size / 2;
      const top = height / 2 - size / 2;
      const centerRay = Math.floor((screenX / width) * rays);
      if (centerRay < 0 || centerRay >= zBuffer.length || sprite.distance > zBuffer[centerRay] + 0.2) continue;

      const fill = sprite.enemy.getType() === 'demon' ? '#d64a2f' : sprite.enemy.getType() === 'soldier' ? '#80929a' : '#b54848';
      ctx.fillStyle = fill;
      ctx.fillRect(left, top, size, size);
      ctx.fillStyle = '#1a1010';
      ctx.fillRect(left + size * 0.2, top + size * 0.25, size * 0.18, size * 0.18);
      ctx.fillRect(left + size * 0.62, top + size * 0.25, size * 0.18, size * 0.18);
      ctx.fillRect(left + size * 0.3, top + size * 0.66, size * 0.4, size * 0.12);
    }
  }

  private renderWeapon(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const bob = Math.sin(performance.now() / 130) * 4;
    const flash = this.lastShotFlash > 0 ? '#f8dc74' : '#d7d0c4';
    const gunX = width / 2 - 80;
    const gunY = height - 120 + bob;

    ctx.fillStyle = '#3b3430';
    ctx.fillRect(gunX + 25, gunY + 10, 110, 56);
    ctx.fillStyle = flash;
    ctx.fillRect(gunX + 100, gunY + 0, 26, 24);
    ctx.fillStyle = '#7c746d';
    ctx.fillRect(gunX + 10, gunY + 36, 80, 44);
  }

  private renderHud(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = 'rgba(16,12,12,0.9)';
    ctx.fillRect(0, height - 68, width, 68);
    ctx.strokeStyle = '#8f6f4a';
    ctx.strokeRect(0, height - 68, width, 68);

    ctx.fillStyle = '#f2e7cf';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`HP ${String(this.player.getHealth()).padStart(3, '0')}`, 22, height - 25);
    ctx.fillText(`AMMO ${String(this.weapon.getAmmo()).padStart(3, '0')}`, 170, height - 25);
    ctx.fillText(`KILLS ${String(this.score).padStart(2, '0')}`, 360, height - 25);

    ctx.strokeStyle = '#d4c6a8';
    ctx.beginPath();
    ctx.moveTo(width / 2 - 10, height / 2);
    ctx.lineTo(width / 2 + 10, height / 2);
    ctx.moveTo(width / 2, height / 2 - 10);
    ctx.lineTo(width / 2, height / 2 + 10);
    ctx.stroke();
  }

  private shadeColor(hex: string, mult: number) {
    const value = hex.replace('#', '');
    const r = Math.round(parseInt(value.slice(0, 2), 16) * mult);
    const g = Math.round(parseInt(value.slice(2, 4), 16) * mult);
    const b = Math.round(parseInt(value.slice(4, 6), 16) * mult);
    return `rgb(${r}, ${g}, ${b})`;
  }

  shoot() {
    if (this.status !== 'playing') return;
    const now = performance.now() / 1000;
    if (!this.weapon.shoot(now)) return;

    this.lastShotFlash = 1;

    const alive = this.enemies.filter((enemy) => enemy.isAlive());
    let best: { enemy: Enemy; distance: number } | null = null;

    for (const enemy of alive) {
      const dx = enemy.getX() - this.player.getX();
      const dy = enemy.getY() - this.player.getY();
      const distance = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      let angleDiff = angle - this.player.getAngle();
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      const absDiff = Math.abs(angleDiff);
      if (absDiff < 0.1 && (!best || distance < best.distance)) {
        best = { enemy, distance };
      }
    }

    if (best && best.distance < 8) {
      const died = best.enemy.takeDamage(this.weapon.getDamage());
      if (died) {
        this.score += 1;
        this.emitStateChange();
      }
    }
  }

  getUiState() {
    return {
      health: this.player.getHealth(),
      ammo: this.weapon.getAmmo(),
      score: this.score,
      status: this.status,
    };
  }
}
