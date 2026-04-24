export class Player {
  private x: number;
  private y: number;
  private angle: number;
  private health = 100;
  private moveSpeed = 2.8;
  private turnSpeed = 2.2;
  private radius = 0.2;
  private hasKey = false;

  constructor(x: number, y: number, angle = 0) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  update(dt: number, keys: Record<string, boolean>, map: number[][]) {
    let moveX = 0;
    let moveY = 0;

    const forwardX = Math.cos(this.angle);
    const forwardY = Math.sin(this.angle);
    const strafeX = Math.cos(this.angle + Math.PI / 2);
    const strafeY = Math.sin(this.angle + Math.PI / 2);

    if (keys['arrowleft']) this.angle -= this.turnSpeed * dt;
    if (keys['arrowright']) this.angle += this.turnSpeed * dt;

    if (keys['w'] || keys['arrowup']) {
      moveX += forwardX;
      moveY += forwardY;
    }
    if (keys['s'] || keys['arrowdown']) {
      moveX -= forwardX;
      moveY -= forwardY;
    }
    if (keys['a']) {
      moveX -= strafeX;
      moveY -= strafeY;
    }
    if (keys['d']) {
      moveX += strafeX;
      moveY += strafeY;
    }

    const len = Math.hypot(moveX, moveY) || 1;
    moveX = (moveX / len) * this.moveSpeed * dt;
    moveY = (moveY / len) * this.moveSpeed * dt;

    this.tryMove(this.x + moveX, this.y, map);
    this.tryMove(this.x, this.y + moveY, map);

    const tau = Math.PI * 2;
    this.angle = ((this.angle % tau) + tau) % tau;
  }

  private tryMove(nextX: number, nextY: number, map: number[][]) {
    const canMove = (x: number, y: number) => {
      const left = Math.floor(x - this.radius);
      const right = Math.floor(x + this.radius);
      const top = Math.floor(y - this.radius);
      const bottom = Math.floor(y + this.radius);
      return [
        map[top]?.[left],
        map[top]?.[right],
        map[bottom]?.[left],
        map[bottom]?.[right],
      ].every((cell) => cell === 0);
    };

    if (canMove(nextX, nextY)) {
      this.x = nextX;
      this.y = nextY;
    }
  }

  updateAngle(delta: number) {
    this.angle += delta;
  }

  damage(amount: number) {
    this.health = Math.max(0, this.health - amount);
  }

  heal(amount: number) {
    this.health = Math.min(100, this.health + amount);
  }

  setHealth(value: number) {
    this.health = Math.max(0, Math.min(100, value));
  }

  giveKey() {
    this.hasKey = true;
  }

  consumeKey() {
    if (!this.hasKey) return false;
    this.hasKey = false;
    return true;
  }

  setHasKey(value: boolean) {
    this.hasKey = value;
  }

  getHasKey() { return this.hasKey; }
  getX() { return this.x; }
  getY() { return this.y; }
  getAngle() { return this.angle; }
  getHealth() { return this.health; }
}
