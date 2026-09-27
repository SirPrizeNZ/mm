/** Original MiniGrid Racers simulation. All positions are in authored canvas units. */
export const WIDTH = 960;
export const HEIGHT = 600;
export const TICK_MS = 1000 / 30;
export const COLORS = ['#ee3545', '#2489ff', '#ffd83b', '#39cf76', '#a64bff',
  '#ff9230', '#00d5d2', '#ec70ba', '#20232c', '#a8adb8'] as const;
export const TRACKS = [
  { name: 'Harbour Loop', rx: 305, ry: 185, road: 90, shade: '#263e52' },
  { name: 'Garden Circuit', rx: 276, ry: 190, road: 90, shade: '#355642' },
  { name: 'Desert Ring', rx: 315, ry: 166, road: 90, shade: '#805a3b' },
] as const;
export const TRACK_NAMES = TRACKS.map(t => t.name);
export const LEFT = 0x80, RIGHT = 0x40, UP = 0x20, DOWN = 0x10;

function bend(track: number, phase: number): number {
  if (track === 1) return .13 * Math.sin(3 * phase);
  if (track === 2) return .11 * Math.cos(2 * phase) - .07 * Math.cos(4 * phase);
  return 0;
}

function point(track: number, phase: number): [number, number] {
  const t = TRACKS[track] ?? TRACKS[0];
  const radius = 1 + bend(track, phase);
  return [480 + t.rx * radius * Math.cos(phase), 300 + t.ry * radius * Math.sin(phase)];
}

export interface Car { x: number; y: number; angle: number; speed: number; laps: number;
  progress: number; finished: number; }
export interface State { step: number; cars: Car[]; }

export function initialState(players: number, track: number): State {
  return { step: 0, cars: Array.from({ length: players }, (_, i) => {
    const phase = -.08 - Math.floor(i / 2) * .28;
    const [x, y] = point(track, phase);
    const [beforeX, beforeY] = point(track, phase - .01);
    const [afterX, afterY] = point(track, phase + .01);
    return { x: x + (i % 2 ? -13 : 13), y,
      angle: Math.atan2(afterY - beforeY, afterX - beforeX),
      speed: 0, laps: 0, progress: 0, finished: 0 };
  }) };
}

/** Pure fixed-step update: only the agreed track and input bytes affect the result. */
export function advance(state: State, inputs: readonly number[], track: number, laps: number): void {
  const t = TRACKS[track] ?? TRACKS[0];
  for (let i = 0; i < state.cars.length; i++) {
    const car = state.cars[i]!;
    if (car.finished) continue;
    const input = inputs[i] ?? 0;
    const r = Math.hypot((car.x - WIDTH / 2) / t.rx, (car.y - HEIGHT / 2) / t.ry);
    const phase = (Math.atan2((car.y - HEIGHT / 2) / t.ry,
      (car.x - WIDTH / 2) / t.rx) + Math.PI * 2) % (Math.PI * 2);
    const onRoad = Math.abs(r - (1 + bend(track, phase))) < t.road / (2 * Math.max(t.rx, t.ry));
    const acceleration = input & UP ? 0.16 : input & DOWN ? -0.22 : 0;
    car.speed = Math.max(-1.8, Math.min(onRoad ? 4 : 2.4, car.speed + acceleration));
    car.speed *= onRoad ? 0.987 : 0.95;
    if (car.speed > .3) {
      const [beforeX, beforeY] = point(track, phase - .01);
      const [afterX, afterY] = point(track, phase + .01);
      const tangent = Math.atan2(afterY - beforeY, afterX - beforeX);
      const error = Math.atan2(Math.sin(tangent - car.angle), Math.cos(tangent - car.angle));
      car.angle += Math.max(-.06, Math.min(.06, error * .15));
    }
    const turn = ((input & RIGHT ? 1 : 0) - (input & LEFT ? 1 : 0));
    car.angle += turn * 0.07 * Math.min(1, Math.abs(car.speed) / 1.5) * Math.sign(car.speed || 1);
    car.x = Math.max(8, Math.min(WIDTH - 8, car.x + Math.cos(car.angle) * car.speed));
    car.y = Math.max(8, Math.min(HEIGHT - 8, car.y + Math.sin(car.angle) * car.speed));
    const nextPhase = (Math.atan2((car.y - HEIGHT / 2) / t.ry,
      (car.x - WIDTH / 2) / t.rx) + Math.PI * 2) % (Math.PI * 2);
    const nextRadius = Math.hypot((car.x - WIDTH / 2) / t.rx, (car.y - HEIGHT / 2) / t.ry);
    const center = 1 + bend(track, nextPhase);
    const limit = .93 * t.road / (2 * Math.max(t.rx, t.ry));
    const bounded = Math.max(center - limit, Math.min(center + limit, nextRadius));
    if (bounded !== nextRadius) {
      const scale = bounded / nextRadius;
      car.x = WIDTH / 2 + (car.x - WIDTH / 2) * scale;
      car.y = HEIGHT / 2 + (car.y - HEIGHT / 2) * scale;
      car.speed *= .85;
    }
    // Four ordered sectors prevent farming the start line by reversing across it.
    if (onRoad && car.progress === 0 && nextPhase > 1.2 && nextPhase < 2.0) car.progress = 1;
    else if (onRoad && car.progress === 1 && nextPhase > 2.8 && nextPhase < 3.6) car.progress = 2;
    else if (onRoad && car.progress === 2 && nextPhase > 4.3 && nextPhase < 5.0) car.progress = 3;
    else if (onRoad && car.progress === 3 && nextPhase > 5.4) car.progress = 4;
    if (onRoad && car.progress === 4 && nextPhase < 0.5 && car.speed > 0) {
      car.laps++;
      car.progress = 0;
      if (car.laps >= laps) car.finished = state.step + 1;
    }
  }
  state.step++;
}

export function standings(state: State): number[] {
  return state.cars.map((_, i) => i).sort((a, b) => {
    const x = state.cars[a]!, y = state.cars[b]!;
    if (x.finished && y.finished) return x.finished - y.finished || a - b;
    if (x.finished) return -1;
    if (y.finished) return 1;
    return y.laps - x.laps || y.progress - x.progress || a - b;
  });
}

export function stateHash(state: State): number {
  let h = 2166136261;
  const add = (n: number): void => { h = Math.imul(h ^ (Math.round(n * 1000) >>> 0), 16777619); };
  add(state.step);
  for (const c of state.cars) {
    add(c.x); add(c.y); add(c.angle); add(c.speed); add(c.laps); add(c.progress); add(c.finished);
  }
  return h >>> 0;
}

export function drawTrack(ctx: CanvasRenderingContext2D, track: number): void {
  const t = TRACKS[track] ?? TRACKS[0];
  ctx.fillStyle = t.shade; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.beginPath();
  for (let i = 0; i <= 192; i++) {
    const [x, y] = point(track, i * Math.PI * 2 / 192);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.lineJoin = 'round';
  ctx.strokeStyle = '#d1c3a0'; ctx.lineWidth = t.road + 8; ctx.stroke();
  ctx.strokeStyle = '#585e66'; ctx.lineWidth = t.road; ctx.stroke();
  ctx.strokeStyle = '#e6da98'; ctx.lineWidth = 3; ctx.setLineDash([14, 16]); ctx.stroke();
  ctx.setLineDash([]);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 ? '#f8f5e9' : '#20232c';
    ctx.fillRect(point(track, 0)[0] - t.road / 2 + i * t.road / 8, 295,
      t.road / 8 + 1, 10);
  }
  ctx.fillStyle = '#ffffff22';
  for (let i = 0; i < 16; i++) {
    const x = 53 + (i * 149) % 854, y = 40 + (i * 93) % 520;
    if (Math.abs(Math.hypot((x - 480) / t.rx, (y - 300) / t.ry) - 1) < .32) continue;
    ctx.beginPath(); ctx.arc(x, y, 4 + (i % 3) * 3, 0, Math.PI * 2); ctx.fill();
  }
}

export function drawCars(ctx: CanvasRenderingContext2D, state: State, names: readonly string[], mine: number): void {
  state.cars.forEach((car, i) => {
    ctx.save(); ctx.translate(car.x, car.y); ctx.rotate(car.angle);
    ctx.fillStyle = '#0008'; ctx.fillRect(-14, -7, 30, 17);
    ctx.fillStyle = COLORS[i % COLORS.length]!; ctx.fillRect(-14, -8, 28, 16);
    ctx.strokeStyle = '#fff9'; ctx.lineWidth = 1; ctx.strokeRect(-14, -8, 28, 16);
    ctx.fillStyle = '#151c2a'; ctx.fillRect(1, -6, 8, 12);
    ctx.fillStyle = COLORS[i % COLORS.length]!;
    ctx.beginPath(); ctx.arc(2, 0, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff9'; ctx.fillRect(10, -6, 3, 4); ctx.fillRect(10, 2, 3, 4);
    if (i === mine) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(-16, -10, 32, 20); }
    ctx.restore();
    const label = names[i] ?? 'Guest';
    const labelY = car.y + (i % 2 ? 32 : -21);
    ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
    const width = ctx.measureText(label).width + 10;
    ctx.fillStyle = '#10131ce6'; ctx.fillRect(car.x - width / 2, labelY - 13, width, 17);
    ctx.fillStyle = COLORS[i % COLORS.length]!; ctx.fillRect(car.x - width / 2, labelY - 13, 3, 17);
    ctx.fillStyle = '#fff'; ctx.fillText(label, car.x, labelY);
  });
}
