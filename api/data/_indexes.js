import { join } from 'path';

import { ARTIFACTS_DIR } from '../../scripts/build/constants.js';

import extract_key from '../../src/utils/internal/binary-extract/sorted.js';
import { readLz4 } from '../../src/utils/internal/lz4/index.js';


export async function indexed_read(dir, file, indexes) {
  console.time('lz4 index')
  const buf0 = await readLz4(join(ARTIFACTS_DIR, dir, `${file}.index.lz4`));
  console.timeEnd('lz4 index')
  console.time('lz4 base')
  const buf1 = await readLz4(join(ARTIFACTS_DIR, dir, `${file}.compressed.lz4`));
  console.timeEnd('lz4 base')
  // console.time('lz4')
  // const buf0 = await readLz4(join(ARTIFACTS_DIR, dir, `${file}.index.lz4`));
  // const buf1 = await readLz4(join(ARTIFACTS_DIR, dir, `${file}.compressed.lz4`));
  // console.timeEnd('lz4')
  console.time('extract')
  const extracted = extract_key(buf0, indexes)
  console.timeEnd('extract')
  console.time('JSON')
  const output = extracted
    .reduce((acc, { uid, index: [a,b] }) => {
      const base = JSON.parse(buf1.subarray(a,b));
      return { ...acc, [uid]: base };
    }, {});
  console.timeEnd('JSON')
  return output
}