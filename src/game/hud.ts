export class HUD {
  private health: number;
  private armor: number;
  private ammo: number;
  private level: number;

  constructor() {
    this.health = 100;
    this.armor = 0;
    this.ammo = 50;
    this.level = 1;
  }

  updateHealth(amount: number): void {
    this.health = Math.max(0, Math.min(100, this.health + amount));
  }

  updateArmor(amount: number): void {
    this.armor = Math.max(0, Math.min(100, this.armor + amount));
  }

  updateAmmo(amount: number): void {
    this.ammo = Math.max(0, this.ammo + amount);
  }

  getHealth(): number { return this.health; }
  getArmor(): number { return this.armor; }
  getAmmo(): number { return this.ammo; }
  getLevel(): number { return this.level; }

  isDead(): boolean { return this.health <= 0; }

  reset(): void {
    this.health = 100;
    this.armor = 0;
    this.ammo = 50;
    this.level = 1;
  }
}
