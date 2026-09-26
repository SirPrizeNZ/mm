/** Types for relay.mjs and ws.mjs, which are plain JavaScript so they can be run with nothing but node. */
import type { Server } from 'node:http';

export const ALPHABET: string;
export const CODE_LENGTH: number;
export const SESSION_LENGTH: number;
export const MAX_PLAYERS: number;
export const IDLE_MS: number;
export const KEEPALIVE_MS: number;

export function makeCode(rand?: (n: number) => number): string;
export function normaliseCode(input: unknown): string | undefined;
/** The same discriminated shape the poll uses, so a caller can read `.error` without narrowing first. */
export type Join =
  | { create: true; code?: undefined; error?: undefined }
  | { create?: undefined; code: string; ensure?: boolean; error?: undefined }
  | { create?: undefined; code?: undefined; error: string };
export function parseJoin(text: string): Join;
export function tag(slot: number, payload: Uint8Array): Buffer;

export interface Joined { slot: number; peers: number[] }
export class Rooms {
  constructor(max?: number, now?: () => number);
  readonly rooms: Map<string, { members: Map<number, unknown>; at: number; result?: { gen: number; points: number[]; at: number } }>;
  create(rand?: (n: number) => number): string | undefined;
  ensure(code: string): boolean;
  join<T>(code: string, member: T): (Joined & { error?: undefined }) | { slot?: undefined; peers?: undefined; error: string };
  leave(code: string, slot: number): void;
  others<T>(code: string, slot: number): T[];
  size(code: string): number;
  result(code: string): { gen: number; points: number[]; at: number } | undefined;
  recordResult(code: string, result: { gen: number; points: number[]; at: number }): void;
  sweep(): void;
}

export function start(port?: number): Server;
