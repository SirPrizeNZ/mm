/** Extra online car tints. These palette entries are unused by the game's track and sprite artwork. */
export const EXTENDED_CAR_TINT_MARKER = 0x100;

const TINTS = [
  { pixels: [236, 237], rgb6: [[63, 32, 0], [38, 16, 0]] },       // orange / burnt orange
  { pixels: [240, 241], rgb6: [[0, 63, 63], [0, 31, 35]] },       // cyan / deep teal
  { pixels: [243, 244], rgb6: [[40, 0, 63], [18, 0, 32]] },      // violet / deep violet
  { pixels: [245, 246], rgb6: [[63, 63, 63], [34, 34, 34]] },    // white / charcoal
  { pixels: [247, 248], rgb6: [[8, 8, 8], [2, 2, 2]] },         // black / near-black
  { pixels: [249, 250], rgb6: [[45, 45, 45], [25, 25, 25]] },   // grey / dark grey
] as const;

/** Store a marked car id in [+0x1252]; low values remain the original DOS palette offsets. */
export function extendedCarTint(carIndex: number): number {
  if (!Number.isInteger(carIndex) || carIndex < 4 || carIndex > 9) throw new RangeError('extended car index must be 4..9');
  return EXTENDED_CAR_TINT_MARKER | carIndex;
}

/** Install two carefully chosen RGB6 shades for each extended car without changing the track palette. */
export function applyExtendedCarPalette(palette: Uint8Array): void {
  if (palette.length !== 768) throw new Error(`palette must be 768 bytes, got ${palette.length}`);
  for (let i = 0; i < TINTS.length; i++) {
    const tint = TINTS[i]!;
    for (let shade = 0; shade < 2; shade++) {
      const index = tint.pixels[shade]!;
      const rgb = tint.rgb6[shade]!;
      palette.set(rgb, index * 3);
    }
  }
}

/** Only sprite colours 1 and 2 are recoloured by the DOS routine; preserve that shading distinction. */
export function recolourCarPixel(pixel: number, colour: number): number {
  const shade = pixel & 0x0F;
  if (shade > 2) return pixel;
  if (colour & EXTENDED_CAR_TINT_MARKER) {
    const carIndex = colour & 0x0F;
    const tint = TINTS[carIndex - 4];
    if (!tint) throw new Error(`missing extended-car tint ${carIndex}`);
    return tint.pixels[shade === 2 ? 1 : 0]!;
  }
  return (pixel + colour) & 0xFF;
}

/** Catch any future game-data release that starts using one of the custom tint palette entries. */
export function assertTintPaletteSlotsUnused(art: readonly Uint8Array[]): void {
  const used = new Uint8Array(256);
  for (const bytes of art) for (const pixel of bytes) used[pixel] = 1;
  for (const tint of TINTS) for (const index of tint.pixels) {
    if (used[index]) throw new Error(`extended-car palette slot ${index} is used by game artwork`);
  }
}
