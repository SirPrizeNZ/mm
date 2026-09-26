import { describe, expect, it } from 'vitest';
import { setupRace, type RaceFiles, type RaceParams } from '../../src/engine/setup';

const params: RaceParams = {
  round: 2, track: 1, challengeIndex: 0, mode: 1,
  inputs: [4, 5, 4, 5], characters: [3, 5, 10, 6],
};

describe('fifth player boundary', () => {
  it('rejects more than ten or more humans than cars', () => {
    expect(() => setupRace({} as RaceFiles, { ...params, cars: 11 })).toThrow(/2..10/);
    expect(() => setupRace({} as RaceFiles, { ...params, cars: 4, humanCars: 5 })).toThrow(/2..10/);
  });
});
