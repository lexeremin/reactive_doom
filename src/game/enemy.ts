export type EnemyType = 'imp' | 'demon' | 'soldier';

export class Enemy {
  private x: number;
  private y: number;
  private health: number;
  private maxHealth: number;
  private alive = true;
  private type: EnemyType;
  private attackCooldown = 0;
  private hitFlash = 0;
  private damage: number;
  private moveSpeed: number;
  private aggroRange: number;

  constructor(x: number, y: number, type: EnemyType, scaleLevel = 1) {
    this.x = x;
    this.y = y;
    this.type = type;

    const extraLevels = Math.max(0, scaleLevel - 2);
    const damageTier = Math.floor(Math.max(0, scaleLevel - 1) / 10);

    const baseHealth = type === 'demon' ? 95 : type === 'soldier' ? 55 : 40;
    const healthGrowth = type === 'demon' ? 10 : type === 'soldier' ? 7 : 5;
    this.maxHealth = baseHealth + extraLevels * healthGrowth;
    this.health = this.maxHealth;

    const baseDamage = type === 'demon' ? 22 : type === 'soldier' ? 15 : 11;
    const damageGrowth = type === 'demon' ? 3 : 2;
    this.damage = baseDamage + damageTier * damageGrowth;

    this.moveSpeed = type === 'demon' ? 1.35 : type === 'soldier' ? 1.02 : 1.08;
    this.aggroRange = 8.5;
  }

  update(dt: number, playerX: number, playerY: number, map: number[][]) {
    if (!this.alive) return 0;

    this.hitFlash = Math.max(0, this.hitFlash - dt * 4);

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.hypot(dx, dy);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    if (dist > 0.85 && dist < this.aggroRange) {
      const nextX = this.x + (dx / dist) * this.moveSpeed * dt;
      const nextY = this.y + (dy / dist) * this.moveSpeed * dt;
      if (map[Math.floor(nextY)]?.[Math.floor(nextX)] === 0) {
        this.x = nextX;
        this.y = nextY;
      }
    }

    if (dist <= 1.35 && this.attackCooldown <= 0) {
      this.attackCooldown = this.type === 'demon' ? 0.8 : this.type === 'soldier' ? 1.05 : 1.2;
      return this.damage;
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
  getMaxHealth() { return this.maxHealth; }
  getHitFlash() { return this.hitFlash; }
}
