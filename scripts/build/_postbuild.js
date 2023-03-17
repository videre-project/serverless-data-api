import { join } from 'path';

import chalk from 'chalk';

import { collectionsMap } from '../../api/data/index.js';

import { read_lz4_json, write_lz4_json } from './lib/lz4/json.js';

import { ARTIFACTS_DIR } from './constants.js';

import { formatTime } from '../../src/utils/formatting.js';
import log from '../../src/utils/log.js';


/**
 * Indexes buffered JSON by a primary key
 */
async function indexJSON(json, { by, on }) {
  const $buf = Buffer.from(JSON.stringify(json));
  const index = await json.reduce(async (arr, obj) => {
    const $obj = Buffer.from(JSON.stringify(obj));
    const $idx = $buf.indexOf($obj);
    const entry = {
      ...Object.fromEntries(on.map(key => [key,obj[key]])),
      _: obj[by], index: [$idx, $idx + $obj.length],
    };
    // Wait for all promises to resolve.
    (await arr).push(entry); return arr;
  },[]);
  // Create hashmap of indexes by primary key.
  return Object.fromEntries(index.map(({_,...e}) => [_,e]));
};

/**
 * Create __sortedIndex__ attr for sorted indexes.
 */
function createSortIndex(index) {
  const $index = Buffer.from(JSON.stringify(index));
  const keys = Object.keys(index);
  function char_idx(c, _index=$index) {
    const match = keys.filter(k => k.charCodeAt(0) === c)?.[0];
    const idx = _index.indexOf(Buffer.from(`"${match}":`));
    return idx !== -1 && idx || $index.length - 1;
  }
  // Build initial sortIndex w/o offset
  const _idxs = [...new Set(keys.map(s => s.charCodeAt(0)))];
  let sortIndex =  Object.fromEntries(
    _idxs.map((c,i) => [c, [char_idx(c), char_idx(_idxs[i+1])]])
  );
  // Update sortIndex with new offset
  const $new_index = (__sortIndex__) =>
    Buffer.from(JSON.stringify({ __sortIndex__, ...index }));
  const is_valid = (sortIndex) =>
    sortIndex[_idxs[0]][0] === char_idx(_idxs[0], $new_index(sortIndex));
  while (!is_valid(sortIndex)) {
    for (let i = 0; i < _idxs.length; i++) {
      const a = sortIndex[_idxs[i]][0];
      const b = char_idx(_idxs[i], $new_index(sortIndex));
      const offset = b-a;
      sortIndex[_idxs[i]][0] += offset;
      sortIndex[_idxs[i]][1] += offset;
    };
  };

  return sortIndex;
};

/**
 * Runs post-build scripts
 */
export default async () => {
  // Handle post-build configuration + cleanup
  let a = log({ color:'blue', label:'Postbuild' }, 'Building indexes...');
  const collections = collectionsMap.filter(({ indexes }) => indexes);
  for (let i = 0; i < collections.length; i++) {
    const { metadata: { name }, indexes } = collections[i];
    // Build indexes
    const entries = Object.keys(indexes);
    for (let j = 0; j < entries.length; j++) {
      const e = entries[j];
      log({ label:'Build' }, `Building ${name}/${e} index...`);
      const dir = join(ARTIFACTS_DIR, name);
      const json = await read_lz4_json(join(dir, `${e}.compressed.lz4`));
      const index = await indexJSON(json, indexes[e]);
      const __sortIndex__ = createSortIndex(index);
      log({ label:'Build' }, `Writing ${name}/${e} index to disk...`);
      write_lz4_json({ __sortIndex__, ...index }, join(dir, `${e}.index.lz4`));
    }
  };
  log({ label:false },
    chalk.green('Success:'),
    `Finished updating indexes in ${formatTime(Date.now() - a)}.`
  );
};