/** Byte image of the game's data segment (DS = 093C) with the 16-bit access helpers the transliterated
 *  routines use. Keeping the original layout reproduces struct offsets, aliasing and wrap-around for free. */
export function s16(v: number): number { v &= 0xFFFF; return v & 0x8000 ? v - 0x10000 : v; }
export function s8(v: number): number { v &= 0xFF; return v & 0x80 ? v - 0x100 : v; }

/** `imul` 16x16 followed by `mov al,ah ; mov ah,dl ; shl ax,1`: (product >> 8) << 1, truncated to 16 bits. */
export function mulfix(a: number, b: number): number {
  const p = s16(a) * s16(b);                 // |p| < 2^31, exact in doubles
  return ((p >> 8) << 1) & 0xFFFF;
}

export class DataSegment {
  readonly m: Uint8Array;
  /** Extra online cars live beyond the original 64 KB segment; DOS addresses still wrap at 64 KB. */
  readonly cars: number[];
  constructor(image?: Uint8Array, carCount = 4) {
    if (!Number.isInteger(carCount) || carCount < 2 || carCount > 10) throw new Error('car count must be 2..10');
    this.cars = Array.from({ length: Math.max(4, carCount) }, (_, i) =>
      i < 4 ? i * 0x164 : 0x10000 + (i - 4) * 0x164);
    this.m = new Uint8Array(carCount > 4 ? 0x12000 : 0x10000);
    if (image) this.m.set(image.subarray(0, 0x10000));
  }
  private at(o: number): number { return o < 0x10000 ? o & 0xFFFF : o; }
  r8(o: number): number { return this.m[this.at(o)]!; }
  rs8(o: number): number { return s8(this.r8(o)); }
  r16(o: number): number { return this.m[this.at(o)]! | (this.m[o < 0x10000 ? (o + 1) & 0xFFFF : o + 1]! << 8); }
  rs16(o: number): number { return s16(this.r16(o)); }
  w8(o: number, v: number): void { this.m[this.at(o)] = v & 0xFF; }
  w16(o: number, v: number): void { v &= 0xFFFF; this.m[this.at(o)] = v & 0xFF; this.m[o < 0x10000 ? (o + 1) & 0xFFFF : o + 1] = v >> 8; }
  add16(o: number, v: number): void { this.w16(o, this.r16(o) + v); }
}

export class NotImplementedYet extends Error {
  constructor(what: string) { super(`not transliterated yet: ${what}`); }
}
