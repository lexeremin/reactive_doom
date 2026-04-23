import { GameEngine } from './engine';
import { Raycaster } from './raycaster';
import { Player } from './player';
import { Enemy } from './enemy';
import { Weapon } from './weapon';
import { Pickup } from './pickup';
import { MAP, getMapDimensions } from './map';

type GameStatus = 'menu' | 'playing' | 'paused' | 'dead' | 'won';

export class Game {
  private engine: GameEngine;
  private raycaster: Raycaster;
  private player!: Player;
  private enemies: Enemy[] = [];
  private weapon!: Weapon;
  private keys: Record<string, boolean> = {};
  private pickups: Pickup[] = [];
  private lastShotFlash = 0;
  private score = 0;
  private status: GameStatus = 'menu';
  private onStateChange?: () => void;
  private wallTextures: Record<number, HTMLCanvasElement>;

  constructor(onStateChange?: () => void) {
    this.engine = new GameEngine('gameCanvas');
    this.raycaster = new Raycaster(MAP, getMapDimensions(MAP).width, getMapDimensions(MAP).height);
    this.onStateChange = onStateChange;
    this.wallTextures = this.createWallTextures();
    this.resetWorld();
    this.setupInput();
  }

  private createWallTextures() {
    const makeTexture = (base: string, dark: string, accent: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = base;
      ctx.fillRect(0, 0, 32, 32);

      for (let y = 0; y < 32; y += 8) {
        for (let x = 0; x < 32; x += 8) {
          ctx.fillStyle = (x + y) % 16 === 0 ? dark : base;
          ctx.fillRect(x, y, 8, 8);
        }
      }

      ctx.fillStyle = accent;
      for (let i = 0; i < 32; i += 4) {
        ctx.fillRect(i, 0, 1, 32);
      }

      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      for (let i = 0; i < 32; i += 8) {
        ctx.fillRect(0, i, 32, 1);
      }

      return canvas;
    };

    return {
      1: makeTexture('#78624a', '#5d4b38', '#9d805e'),
      2: makeTexture('#4e7a61', '#365744', '#76a98a'),
      3: makeTexture('#7a4f4f', '#5d3939', '#ab6a6a'),
    };
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

    this.pickups = [
      new Pickup(3.5, 2.5, 'ammo', 18),
      new Pickup(6.5, 6.5, 'health', 20),
      new Pickup(9.5, 4.5, 'ammo', 24),
      new Pickup(11.5, 9.5, 'health', 25),
      new Pickup(13.5, 13.5, 'ammo', 30),
    ];
  }

  private emitStateChange() {
    this.onStateChange?.();
  }

  private setupInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;

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
      if (this.status === 'playing' && document.pointerLockElement !== canvas) {
        canvas.requestPointerLock?.();
      }
    });

    canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      if (this.status !== 'playing') return;

      if (document.pointerLockElement === canvas) {
        this.shoot();
      } else {
        canvas.requestPointerLock?.();
      }
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

  private hasLineOfSight(fromX: number, fromY: number, toX: number, toY: number) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.hypot(dx, dy);
    const steps = Math.max(8, Math.ceil(distance * 20));

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const x = fromX + dx * t;
      const y = fromY + dy * t;
      if (MAP[Math.floor(y)]?.[Math.floor(x)] > 0) return false;
    }

    return true;
  }

  private update(dt: number) {
    if (this.status !== 'playing') return;

    this.player.update(dt, this.keys, MAP);
    this.lastShotFlash = Math.max(0, this.lastShotFlash - dt * 4);

    for (const enemy of this.enemies) {
      const visible = this.hasLineOfSight(enemy.getX(), enemy.getY(), this.player.getX(), this.player.getY());
      const damage = visible ? enemy.update(dt, this.player.getX(), this.player.getY(), MAP) : 0;
      if (damage > 0) this.player.damage(damage);
    }

    for (const pickup of this.pickups) {
      if (pickup.isCollected()) continue;
      const dist = Math.hypot(this.player.getX() - pickup.getX(), this.player.getY() - pickup.getY());
      if (dist < 0.6) {
        if (pickup.getType() === 'health') {
          const before = this.player.getHealth();
          this.player.heal(pickup.getAmount());
          if (this.player.getHealth() > before) pickup.collect();
        } else {
          const gained = this.weapon.addAmmo(pickup.getAmount());
          if (gained > 0) pickup.collect();
        }
        this.emitStateChange();
      }
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
      const x = Math.floor((i / rays) * width);
      const colW = Math.ceil(width / rays);
      const top = Math.floor((height - wallHeight) / 2);
      const textureId = MAP[Math.floor(hit.hitY)]?.[Math.floor(hit.hitX)] || 1;
      const texture = this.wallTextures[textureId] || this.wallTextures[1];
      const hitOffset = hit.side === 0 ? hit.hitY % 1 : hit.hitX % 1;
      const texX = Math.max(0, Math.min(31, Math.floor(hitOffset * 32)));

      ctx.drawImage(texture, texX, 0, 1, 32, x, top, colW, wallHeight);

      const shade = Math.min(0.72, corrected / 14) + (hit.side === 1 ? 0.12 : 0);
      ctx.fillStyle = `rgba(0,0,0,${shade})`;
      ctx.fillRect(x, top, colW, wallHeight);
    }

    this.renderPickups(ctx, width, height, zBuffer, rays, fov);
    this.renderSprites(ctx, width, height, zBuffer, rays, fov);
    this.renderWeapon(ctx, width, height);
    this.renderHud(ctx, width, height);
  }

  private renderPickups(ctx: CanvasRenderingContext2D, width: number, height: number, zBuffer: number[], rays: number, fov: number) {
    const items = this.pickups
      .filter((pickup) => !pickup.isCollected())
      .map((pickup) => {
        const dx = pickup.getX() - this.player.getX();
        const dy = pickup.getY() - this.player.getY();
        const distance = Math.hypot(dx, dy);
        const angleToItem = Math.atan2(dy, dx);
        let relative = angleToItem - this.player.getAngle();
        while (relative > Math.PI) relative -= Math.PI * 2;
        while (relative < -Math.PI) relative += Math.PI * 2;
        return { pickup, distance, relative };
      })
      .filter((item) => Math.abs(item.relative) < fov * 0.8)
      .sort((a, b) => b.distance - a.distance);

    for (const item of items) {
      const screenX = ((item.relative + fov / 2) / fov) * width;
      const size = Math.max(10, Math.min(height * 0.16, height / (item.distance * 2.1)));
      const left = screenX - size / 2;
      const top = height / 2 - size / 2 + 12;
      const centerRay = Math.floor((screenX / width) * rays);
      if (centerRay < 0 || centerRay >= zBuffer.length || item.distance > zBuffer[centerRay] + 0.1) continue;

      if (item.pickup.getType() === 'health') {
        ctx.fillStyle = '#5fd36f';
        ctx.fillRect(left, top, size, size);
        ctx.fillStyle = '#1c1408';
        const bar = size * 0.22;
        ctx.fillRect(left + size * 0.39, top + size * 0.18, bar, size * 0.64);
        ctx.fillRect(left + size * 0.18, top + size * 0.39, size * 0.64, bar);
      } else {
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(left, top + size * 0.18, size, size * 0.64);
        ctx.fillStyle = '#6f431c';
        ctx.fillRect(left + size * 0.06, top + size * 0.24, size * 0.88, size * 0.52);
        ctx.fillStyle = '#b47b3f';
        ctx.fillRect(left + size * 0.1, top + size * 0.28, size * 0.8, size * 0.08);
        ctx.fillRect(left + size * 0.1, top + size * 0.62, size * 0.8, size * 0.06);

        const bulletW = size * 0.16;
        const bulletH = size * 0.22;
        const bulletY = top + size * 0.31;
        const offsets = [0.18, 0.42, 0.66];
        ctx.fillStyle = '#111';
        for (const offset of offsets) {
          const bx = left + size * offset;
          ctx.fillRect(bx, bulletY + bulletH * 0.36, bulletW, bulletH * 0.64);
          ctx.beginPath();
          ctx.moveTo(bx, bulletY + bulletH * 0.36);
          ctx.lineTo(bx + bulletW / 2, bulletY);
          ctx.lineTo(bx + bulletW, bulletY + bulletH * 0.36);
          ctx.closePath();
          ctx.fill();
        }

        ctx.fillStyle = '#f1d19c';
        ctx.font = `bold ${Math.max(6, size * 0.12)}px monospace`;
        ctx.fillText('AMMO', left + size * 0.16, top + size * 0.58);
      }
    }
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
        const visible = this.hasLineOfSight(this.player.getX(), this.player.getY(), enemy.getX(), enemy.getY());
        return { enemy, distance, relative, visible };
      })
      .filter((s) => s.visible && Math.abs(s.relative) < fov * 0.8)
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

  shoot() {
    if (this.status !== 'playing') return;
    const now = performance.now() / 1000;
    if (!this.weapon.shoot(now)) return;

    this.lastShotFlash = 1;

    const alive = this.enemies.filter((enemy) => enemy.isAlive());
    let best: { enemy: Enemy; distance: number; angleDiff: number } | null = null;

    for (const enemy of alive) {
      const dx = enemy.getX() - this.player.getX();
      const dy = enemy.getY() - this.player.getY();
      const distance = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      let angleDiff = angle - this.player.getAngle();
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      const absDiff = Math.abs(angleDiff);
      const visible = this.hasLineOfSight(this.player.getX(), this.player.getY(), enemy.getX(), enemy.getY());
      if (!visible) continue;
      if (absDiff < 0.12 && distance < 9) {
        if (!best || absDiff < best.angleDiff || (Math.abs(absDiff - best.angleDiff) < 0.015 && distance < best.distance)) {
          best = { enemy, distance, angleDiff: absDiff };
        }
      }
    }

    if (best) {
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
      maxAmmo: this.weapon.getMaxAmmo(),
      score: this.score,
      status: this.status,
    };
  }
}
