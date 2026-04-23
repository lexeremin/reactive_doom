export class Raycaster {
  private map: number[][];
  private width: number;
  private height: number;

  constructor(map: number[][], width: number, height: number) {
    this.map = map;
    this.width = width;
    this.height = height;
  }

  castRay(x: number, y: number, angle: number, maxDist = 20) {
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);

    let mapX = Math.floor(x);
    let mapY = Math.floor(y);

    const deltaDistX = Math.abs(1 / (dirX || 1e-9));
    const deltaDistY = Math.abs(1 / (dirY || 1e-9));

    let stepX = dirX < 0 ? -1 : 1;
    let stepY = dirY < 0 ? -1 : 1;

    let sideDistX = dirX < 0 ? (x - mapX) * deltaDistX : (mapX + 1 - x) * deltaDistX;
    let sideDistY = dirY < 0 ? (y - mapY) * deltaDistY : (mapY + 1 - y) * deltaDistY;

    let side = 0;
    let distance = maxDist;

    for (let i = 0; i < maxDist * 8; i++) {
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }

      if (mapX < 0 || mapX >= this.width || mapY < 0 || mapY >= this.height) break;
      if (this.map[mapY][mapX] > 0) {
        distance = side === 0
          ? (mapX - x + (1 - stepX) / 2) / (dirX || 1e-9)
          : (mapY - y + (1 - stepY) / 2) / (dirY || 1e-9);
        break;
      }
    }

    return {
      distance: Math.abs(distance),
      side,
      hitX: x + dirX * distance,
      hitY: y + dirY * distance,
    };
  }
}
