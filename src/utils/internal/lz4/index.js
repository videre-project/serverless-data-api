import { promises as fs, writeFileSync, readFileSync } from 'fs';

import { uncompress, uncompressSync, compressSync } from 'lz4-napi';


export async function readLz4(path, options) {
  const output = await fs.readFile(path, options);
  return await uncompress(output);
}

export function readLz4Sync(path, options) {
  const output = readFileSync(path, options);
  return uncompressSync(output);
}

export function writeLz4Sync(path, data, options) {
  const input = compressSync(data);
  writeFileSync(path, input, options);
}