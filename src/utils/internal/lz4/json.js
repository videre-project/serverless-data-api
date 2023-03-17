import { statSync } from 'fs';

import chalk from 'chalk';

import { decompress_benchmark } from './benchmark.js';
import { readLz4Sync, writeLz4Sync } from './index.js';

import log from '../../../../src/utils/log.js';


function formatBytes(bytes) {
  const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
  const unitIndex = Math.min(
    Math.floor(Math.log10(bytes) / 3),
    UNITS.length - 1
  );
  bytes /= 1000 ** unitIndex;

  const size = new Intl.NumberFormat().format(bytes.toFixed(2));
  const unit = UNITS[unitIndex];

  return `${size} ${unit}`;
};

/**
 * Read JSON data synchronously from disk using lz4 decompression
 */
export async function read_lz4_json(filepath, serialize=true) {
  const buf = readLz4Sync(filepath);
  return serialize ? JSON.parse(buf) : buf.toString();
};

/**
 * Write JSON data synchronously to disk using lz4 compression
 */
export function write_lz4_json(data, filepath) {
  // Write data with lz4 compression
  const stringified = JSON.stringify(data);
  writeLz4Sync(filepath, Buffer.from(stringified));

  // Report compression statistics
  const compressed_size = statSync(filepath).size;
  const uncompressed_size = Buffer.byteLength(stringified);
  const compression_ratio = uncompressed_size / compressed_size;

  const decompression_time = decompress_benchmark(filepath);
  log({},
    chalk.yellow('Note:'),
    `Expected decompression time is ${decompression_time}.`
  );

  return {
    algorithm: 'lz4',
    kind: 'lz77',
    compressed_size: formatBytes(compressed_size),
    uncompressed_size: formatBytes(uncompressed_size),
    compression_ratio: Number(compression_ratio.toFixed(4)),
    decompression_time
  };
};