/** Make small, real game-map thumbnails from the existing map/tile/palette decoders. */
import { build } from 'esbuild';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';

const source = `
  import { lzDecode } from './src/data/lzcodec.ts';
  import { decodePalette, paletteToRgba } from './src/data/palette.ts';
  import { decodeTileMap } from './src/data/tilemap.ts';
  import { decodeBlocks, expandMap } from './src/data/blocks.ts';
  export { lzDecode, decodePalette, paletteToRgba, decodeTileMap, decodeBlocks, expandMap };
`;
const bundled = await build({ stdin: { contents: source, resolveDir: process.cwd(), loader: 'ts' },
  bundle: true, platform: 'node', format: 'esm', write: false });
const { lzDecode, decodePalette, paletteToRgba, decodeTileMap, decodeBlocks, expandMap } =
  await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);

const read = async name => new Uint8Array(await readFile(`MicroMac/GAME1/${name}`));
const size = 256;
const outDir = 'figjam/map-previews';
await mkdir(outDir, { recursive: true });

const crcTable = Array.from({ length: 256 }, (_, i) => {
  let n = i;
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xEDB88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (const byte of data) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function chunk(name, data) {
  const type = Buffer.from(name);
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([type, data])));
  return Buffer.concat([len, type, data, crc]);
}
function png(rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  const head = Buffer.alloc(13); head.writeUInt32BE(size, 0); head.writeUInt32BE(size, 4);
  head[8] = 8; head[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', head), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

for (let round = 1; round <= 8; round++) {
  const palette = paletteToRgba(decodePalette(await read(`ROUND${round}.PAL`)));
  const blocks = decodeBlocks(await read(`ROUND${round}BR.CT`), await read(`ROUND${round}.COL`),
    await read(`ROUND${round}.DIR`), await read(`ROUND${round}BR.LEV`));
  const banks = [];
  for (let i = 0; i < 3; i++) {
    try { banks.push(lzDecode(await read(`ROUND${round}BR.PR${i}`)).data); }
    catch (e) { if (i === 0) throw e; break; }
  }
  const tiles = Buffer.concat(banks.map(b => Buffer.from(b)));
  const tileCount = Math.floor(tiles.length / 256);
  for (let track = 1; track <= 3; track++) {
    const map = decodeTileMap(await read(`ROUND${round}${track}.MAP`));
    const world = expandMap(blocks, map.blocks);
    const rgba = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const sx = x * 12, sy = y * 12;
      const tile = world[(sy >> 4) * 192 + (sx >> 4)] & 0x7FFF;
      const index = tile < tileCount ? tiles[tile * 256 + (sy & 15) * 16 + (sx & 15)] : 0;
      const color = palette[index];
      const p = (y * size + x) * 4;
      rgba[p] = color & 255; rgba[p + 1] = (color >>> 8) & 255;
      rgba[p + 2] = (color >>> 16) & 255; rgba[p + 3] = 255;
    }
    await writeFile(`${outDir}/${round}-${track}.png`, png(rgba));
  }
}
console.log('Generated 24 map previews from original game data.');
