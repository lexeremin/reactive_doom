export type EnemyType = 'imp' | 'demon' | 'soldier';

export class Enemy {
  private x: number;
  private y: number;
  private health: number;
  private alive = true;
  private type: EnemyType;
  private attackCooldown = 0;
  private hitFlash = 0;

  constructor(x: number, y: number, type: EnemyType) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.health = type === 'demon' ? 95 : type === 'soldier' ? 55 : 40;
  }

  update(dt: number, playerX: number, playerY: number, map: number[][]) {
    if (!this.alive) return 0;

    this.hitFlash = Math.max(0, this.hitFlash - dt * 4);

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.hypot(dx, dy);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    if (dist > 0.85 && dist < 8.5) {
      const speed = this.type === 'demon' ? 1.35 : this.type === 'soldier' ? 1.02 : 1.08;
      const nextX = this.x + (dx / dist) * speed * dt;
      const nextY = this.y + (dy / dist) * speed * dt;
      if (map[Math.floor(nextY)]?.[Math.floor(nextX)] === 0) {
        this.x = nextX;
        this.y = nextY;
      }
    }

    if (dist <= 1.35 && this.attackCooldown <= 0) {
      this.attackCooldown = this.type === 'demon' ? 0.8 : this.type === 'soldier' ? 1.05 : 1.2;
      return this.type === 'demon' ? 22 : this.type === 'soldier' ? 15 : 11;
    }

    return 0;
  }

  takeDamage(amount: number) {
    if (!this.alive) return false;
    this.health -= amount;
    this.hitFlash = 1;
    if (this.health <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  isAlive() { return this.alive; }
  getX() { return this.x; }
  getY() { return this.y; }
  getType() { return this.type; }
  getHealth() { return this.health; }
  getHitFlash() { return this.hitFlash; }
}
