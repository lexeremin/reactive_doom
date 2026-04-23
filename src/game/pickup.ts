export type PickupType = 'health' | 'ammo' | 'key';

export class Pickup {
  private x: number;
  private y: number;
  private type: PickupType;
  private amount: number;
  private collected = false;

  constructor(x: number, y: number, type: PickupType, amount: number) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.amount = amount;
  }

  isCollected() {
    return this.collected;
  }

  collect() {
    this.collected = true;
  }

  getX() { return this.x; }
  getY() { return this.y; }
  getType() { return this.type; }
  getAmount() { return this.amount; }
}
