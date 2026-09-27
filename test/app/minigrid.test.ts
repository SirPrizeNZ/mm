import { describe, expect, it } from 'vitest';
import { advance, COLORS, initialState, stateHash, TRACKS, UP, LEFT, RIGHT } from '../../src/app/minigrid/race';

describe('original MiniGrid simulation', () => {
  it('provides ten distinct cars on each of three authored tracks', () => {
    expect(new Set(COLORS).size).toBe(10);
    for (let track = 0; track < TRACKS.length; track++) {
      const state = initialState(10, track);
      expect(state.cars).toHaveLength(10);
      expect(new Set(state.cars.map(c => `${c.x},${c.y}`)).size).toBe(10);
    }
  });

  for (const count of [2, 4, 6, 8, 10]) {
    it(`agrees for ${count} independent drivers and changing inputs`, () => {
      const a = initialState(count, 1);
      const b = initialState(count, 1);
      for (let step = 0; step < 600; step++) {
        const input = Array.from({ length: count }, (_, i) => UP
          | ((step + i * 11) % 80 < 40 ? LEFT : RIGHT));
        advance(a, input, 1, 3);
        advance(b, input, 1, 3);
        expect(stateHash(a)).toBe(stateHash(b));
      }
      expect(a.cars.some((car, i) => car.x !== a.cars[(i + 1) % count]!.x
        || car.y !== a.cars[(i + 1) % count]!.y)).toBe(true);
    });
  }

  it('requires ordered sectors before awarding a lap', () => {
    const state = initialState(2, 0);
    const car = state.cars[0]!;
    const t = TRACKS[0];
    car.speed = 2; car.angle = Math.PI / 2;
    const visit = (phase: number): void => {
      car.x = 480 + t.rx * Math.cos(phase);
      car.y = 300 + t.ry * Math.sin(phase);
      advance(state, [0, 0], 0, 1);
    };
    visit(.1); expect(car.laps).toBe(0);
    visit(1.5); visit(3.1); visit(4.6); visit(5.7);
    expect(car.progress).toBe(4);
    visit(.1);
    expect(car.laps).toBe(1);
    expect(car.finished).toBeGreaterThan(0);
  });

  it('can finish an oval lap by driving with arrow inputs', () => {
    const state = initialState(2, 0);
    const car = state.cars[0]!;
    const track = TRACKS[0];
    for (let step = 0; step < 5000 && !car.finished; step++) {
      const phase = Math.atan2((car.y - 300) / track.ry, (car.x - 480) / track.rx);
      const desired = Math.atan2(track.ry * Math.cos(phase), -track.rx * Math.sin(phase));
      const error = Math.atan2(Math.sin(desired - car.angle), Math.cos(desired - car.angle));
      advance(state, [UP | (error > .02 ? RIGHT : error < -.02 ? LEFT : 0), 0], 0, 1);
    }
    expect(car.finished).toBeGreaterThan(0);
  });

  it('lets both starting lanes finish under independent steering', () => {
    const state = initialState(2, 0);
    const track = TRACKS[0];
    for (let step = 0; step < 5000 && state.cars.some(c => !c.finished); step++) {
      const inputs = state.cars.map(car => {
        const phase = Math.atan2((car.y - 300) / track.ry, (car.x - 480) / track.rx);
        const desired = Math.atan2(track.ry * Math.cos(phase), -track.rx * Math.sin(phase));
        const error = Math.atan2(Math.sin(desired - car.angle), Math.cos(desired - car.angle));
        return UP | (error > .02 ? RIGHT : error < -.02 ? LEFT : 0);
      });
      advance(state, inputs, 0, 1);
    }
    expect(state.cars.map(c => c.finished > 0)).toEqual([true, true]);
  });
});
