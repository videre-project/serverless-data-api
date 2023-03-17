import { createHash } from 'crypto';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

import { write_lz4_json } from './json.js';

import { ARTIFACTS_DIR } from '../../constants.js';

import log, { formatDurationString } from '../../../../src/utils/log.js';


/**
 * Read catalog file for a given datastore collection type.
 */
export function readCatalog(name, part) {
  const stem = join(ARTIFACTS_DIR, name);
  const raw = readFileSync(join(stem, `${part || 'base'}.catalog.json`));
  try { return JSON.parse(raw); }
  catch (e) { return null; }
};

/**
 * Write a collection datastore to disk using lz4 compression.
 */
export function writeCollection(data, { meta, dir, name }) {
  const base = join(process.cwd(), 'artifacts', dir);
  if (!existsSync(base)) mkdirSync(base, { recursive: true });
  const stem = join(base, name);

  // Write data with lz4 compression, returning compression details
  log({ label: false }, ''); // Add linebreak to build script
  let a = log({ color: 'blue', label: 'Build' },
    `Compressing ${dir}/${name} data with lz4 compression...`
  );
  const lz4 = write_lz4_json(data, `${join(base, name)}.compressed.lz4`);
  log({ label: 'Build' },`Wrote ${dir}/${name} to disk.`);
  log({},formatDurationString(a));

  // Get hash sum of buffered json
  log({ label: 'Build' }, 'Getting uncompressed data sha265 hash...');
  const hashSum = createHash('sha256');
  hashSum.update(Buffer.from(JSON.stringify(data)));

  // Write catalog to disk with file & compression metadata
  const { timestamp, ...details } = meta;
  log({ label: 'Build' },`Writing ${dir}/${name} catalog to disk...`);
  const catalog = {
    object: 'catalog',
    timestamp,
    compression: {
      ...lz4,
      sha256: hashSum.digest('hex')
    },
    details
  };
  writeFileSync(`${stem}.catalog.json`, JSON.stringify(catalog));

  return catalog;
};