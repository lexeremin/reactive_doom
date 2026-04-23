export const LEVELS = [
  {
    start: { x: 1.5, y: 1.5, angle: 0.1 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,2,2,2,0,0,3,3,3,0,0,0,0,1],
      [1,0,0,2,0,0,0,0,0,0,3,0,0,0,0,1],
      [1,0,0,2,0,0,0,0,0,0,3,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,3,0,0,0,0,0,0,2,0,0,0,0,1],
      [1,0,0,3,0,0,0,0,0,0,2,0,0,0,0,1],
      [1,0,0,3,3,0,0,0,0,2,2,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,4,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    enemies: [
      { x: 8.0, y: 8.0, type: 'imp' as const },
      { x: 10.5, y: 8.5, type: 'demon' as const },
      { x: 4.5, y: 10.5, type: 'soldier' as const },
      { x: 11.5, y: 3.5, type: 'imp' as const },
    ],
    pickups: [
      { x: 3.5, y: 2.5, type: 'ammo' as const, amount: 18 },
      { x: 6.5, y: 6.5, type: 'health' as const, amount: 20 },
      { x: 5.5, y: 12.5, type: 'key' as const, amount: 1 },
      { x: 9.5, y: 4.5, type: 'ammo' as const, amount: 24 },
      { x: 11.5, y: 9.5, type: 'health' as const, amount: 25 },
    ],
    exitDoors: [{ x: 14, y: 11, needsKey: true }],
  },
  {
    start: { x: 1.5, y: 13.5, angle: -0.2 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,4,1],
      [1,0,2,2,2,0,0,0,3,3,3,0,0,0,0,1],
      [1,0,2,0,2,0,0,0,3,0,3,0,0,0,0,1],
      [1,0,2,0,2,0,0,0,3,0,3,0,0,0,0,1],
      [1,0,2,0,2,0,0,0,3,0,3,0,0,0,0,1],
      [1,0,2,0,2,0,0,0,3,0,3,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,3,3,0,0,0,2,2,0,0,0,0,0,1],
      [1,0,0,3,0,0,0,0,2,0,0,0,0,0,0,1],
      [1,0,0,3,0,0,0,0,2,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    enemies: [
      { x: 4.5, y: 3.5, type: 'soldier' as const },
      { x: 9.5, y: 3.5, type: 'imp' as const },
      { x: 10.5, y: 10.5, type: 'demon' as const },
      { x: 13.5, y: 6.5, type: 'soldier' as const },
      { x: 12.5, y: 12.5, type: 'imp' as const },
    ],
    pickups: [
      { x: 2.5, y: 12.5, type: 'ammo' as const, amount: 20 },
      { x: 6.5, y: 7.5, type: 'health' as const, amount: 25 },
      { x: 12.5, y: 5.5, type: 'key' as const, amount: 1 },
      { x: 13.5, y: 13.5, type: 'ammo' as const, amount: 30 },
    ],
    exitDoors: [{ x: 14, y: 1, needsKey: true }],
  },
] as const;

export function createLevel(index: number) {
  const level = LEVELS[index];
  return {
    start: { ...level.start },
    map: level.map.map((row) => [...row]),
    enemies: level.enemies.map((enemy) => ({ ...enemy })),
    pickups: level.pickups.map((pickup) => ({ ...pickup })),
    exitDoors: level.exitDoors.map((door) => ({ ...door })),
  };
}

export function getLevelCount() {
  return LEVELS.length;
}

export function getMapDimensions(map: number[][]) {
  return {
    width: map[0].length,
    height: map.length,
  };
}
