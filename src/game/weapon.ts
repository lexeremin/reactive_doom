export class Weapon {
  private ammo = 60;
  private readonly maxAmmo = 120;
  private readonly fireRate = 0.22;
  private readonly damage = 20;
  private lastShotAt = -999;

  canShoot(now: number) {
    return this.ammo > 0 && now - this.lastShotAt >= this.fireRate;
  }

  shoot(now: number) {
    if (!this.canShoot(now)) return false;
    this.lastShotAt = now;
    this.ammo -= 1;
    return true;
  }

  addAmmo(amount: number) {
    const before = this.ammo;
    this.ammo = Math.min(this.maxAmmo, this.ammo + amount);
    return this.ammo - before;
  }

  getDamage() { return this.damage; }
  getAmmo() { return this.ammo; }
  getMaxAmmo() { return this.maxAmmo; }
}
