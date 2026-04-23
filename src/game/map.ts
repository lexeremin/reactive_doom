export type EnemySpec = { x: number; y: number; type: 'imp' | 'demon' | 'soldier' };
export type PickupSpec = { x: number; y: number; type: 'health' | 'ammo' | 'key'; amount: number };
export type ExitDoorSpec = { x: number; y: number; needsKey: boolean };

export type LevelData = {
  start: { x: number; y: number; angle: number };
  map: number[][];
  startEnemies: EnemySpec[];
  exitDoors: ExitDoorSpec[];
  randomizePickups?: boolean;
  randomizeEnemies?: boolean;
  randomEnemyRange?: { min: number; max: number };
};

const FIXED_LEVELS: LevelData[] = [
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
    startEnemies: [
      { x: 8.0, y: 8.0, type: 'imp' },
      { x: 10.5, y: 8.5, type: 'demon' },
      { x: 4.5, y: 10.5, type: 'soldier' },
      { x: 11.5, y: 3.5, type: 'imp' },
    ],
    exitDoors: [{ x: 14, y: 11, needsKey: true }],
    randomizePickups: true,
    randomizeEnemies: false,
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
    startEnemies: [],
    exitDoors: [{ x: 14, y: 1, needsKey: true }],
    randomizePickups: true,
    randomizeEnemies: true,
    randomEnemyRange: { min: 2, max: 5 },
  },
];

function cloneMap(map: number[][]) {
  return map.map((row) => [...row]);
}

function cloneLevel(level: LevelData): LevelData {
  return {
    start: { ...level.start },
    map: cloneMap(level.map),
    startEnemies: level.startEnemies.map((enemy) => ({ ...enemy })),
    exitDoors: level.exitDoors.map((door) => ({ ...door })),
    randomizePickups: level.randomizePickups,
    randomizeEnemies: level.randomizeEnemies,
    randomEnemyRange: level.randomEnemyRange ? { ...level.randomEnemyRange } : undefined,
  };
}

export function createLevel(index: number): LevelData {
  if (index < FIXED_LEVELS.length) return cloneLevel(FIXED_LEVELS[index]);

  // Temporary placeholder until procedural generation lands.
  const base = cloneLevel(FIXED_LEVELS[1]);
  return {
    ...base,
    randomizePickups: true,
    randomizeEnemies: true,
    randomEnemyRange: { min: 2, max: 5 },
  };
}

export function getLevelCount() {
  return 100;
}

export function getFixedLevelCount() {
  return FIXED_LEVELS.length;
}

export function getMapDimensions(map: number[][]) {
  return {
    width: map[0].length,
    height: map.length,
  };
}
