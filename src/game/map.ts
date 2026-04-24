export type EnemySpec = { x: number; y: number; type: 'imp' | 'demon' | 'soldier' };
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

type Room = { x: number; y: number; w: number; h: number; cx: number; cy: number };

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

function carveRoom(map: number[][], room: Room) {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      map[y][x] = 0;
    }
  }
}

function carveHCorridor(map: number[][], x1: number, x2: number, y: number) {
  const start = Math.min(x1, x2);
  const end = Math.max(x1, x2);
  for (let x = start; x <= end; x++) map[y][x] = 0;
}

function carveVCorridor(map: number[][], y1: number, y2: number, x: number) {
  const start = Math.min(y1, y2);
  const end = Math.max(y1, y2);
  for (let y = start; y <= end; y++) map[y][x] = 0;
}

function generateProceduralLevel(index: number): LevelData {
  const width = 26;
  const height = 24;
  const map = Array.from({ length: height }, () => Array(width).fill(1));
  const rooms: Room[] = [];
  const roomCount = 5 + Math.min(5, Math.floor((index - 2) / 6));

  const entranceRoom = { x: 2, y: Math.floor(height / 2) - 3, w: 5, h: 6, cx: 4, cy: Math.floor(height / 2) };
  for (let y = entranceRoom.y; y < entranceRoom.y + entranceRoom.h; y++) {
    for (let x = entranceRoom.x; x < entranceRoom.x + entranceRoom.w; x++) {
      map[y][x] = 0;
    }
  }

  const exitRoom = { x: width - 7, y: Math.floor(height / 2) - 3, w: 5, h: 6 };
  for (let y = exitRoom.y; y < exitRoom.y + exitRoom.h; y++) {
    for (let x = exitRoom.x; x < exitRoom.x + exitRoom.w; x++) {
      map[y][x] = 0;
    }
  }
  const gateX = exitRoom.x + exitRoom.w - 1;
  const gateY = exitRoom.y + Math.floor(exitRoom.h / 2);
  map[gateY][gateX] = 4;

  for (let attempts = 0; attempts < 100 && rooms.length < roomCount; attempts++) {
    const w = 4 + Math.floor(Math.random() * 5);
    const h = 4 + Math.floor(Math.random() * 5);
    const x = entranceRoom.x + entranceRoom.w + 1 + Math.floor(Math.random() * (width - w - entranceRoom.w - 9));
    const y = 1 + Math.floor(Math.random() * (height - h - 2));
    const room: Room = { x, y, w, h, cx: x + Math.floor(w / 2), cy: y + Math.floor(h / 2) };

    const overlaps = rooms.some((r) => x - 1 <= r.x + r.w && x + w + 1 >= r.x && y - 1 <= r.y + r.h && y + h + 1 >= r.y);
    if (overlaps) continue;

    carveRoom(map, room);
    if (rooms.length > 0) {
      const prev = rooms[rooms.length - 1];
      if (Math.random() > 0.5) {
        carveHCorridor(map, prev.cx, room.cx, prev.cy);
        carveVCorridor(map, prev.cy, room.cy, room.cx);
      } else {
        carveVCorridor(map, prev.cy, room.cy, prev.cx);
        carveHCorridor(map, prev.cx, room.cx, room.cy);
      }
    }
    rooms.push(room);
  }

  if (rooms.length < 2) return cloneLevel(FIXED_LEVELS[1]);

  const firstRoom = rooms[0];
  carveHCorridor(map, entranceRoom.x + entranceRoom.w - 1, firstRoom.cx, entranceRoom.cy);
  carveVCorridor(map, entranceRoom.cy, firstRoom.cy, firstRoom.cx);

  const lastRoom = rooms[rooms.length - 1];
  carveHCorridor(map, lastRoom.cx, exitRoom.x, lastRoom.cy);
  carveVCorridor(map, lastRoom.cy, exitRoom.y + Math.floor(exitRoom.h / 2), exitRoom.x);

  return {
    start: { x: entranceRoom.cx + 0.5, y: entranceRoom.cy + 0.5, angle: 0 },
    map,
    startEnemies: [],
    exitDoors: [{ x: gateX, y: gateY, needsKey: true }],
    randomizePickups: true,
    randomizeEnemies: true,
    randomEnemyRange: { min: 2, max: 5 },
  };
}

export function createLevel(index: number): LevelData {
  if (index < FIXED_LEVELS.length) return cloneLevel(FIXED_LEVELS[index]);
  return generateProceduralLevel(index);
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
