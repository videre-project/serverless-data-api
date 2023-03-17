import { readFileSync } from 'fs';

import { uncompressSync } from 'lz4-napi';


/**
 * Runs decompression benchmark for average decompression time.
 */
export function decompress_benchmark(filepath, iterations=100) {
  const raw = readFileSync(filepath);

  // Sample decompression times
  const times = [];
  for (let i = 0; i < iterations; i++) {
    const time_1 = Date.now();
    let data = uncompressSync(raw);
    const time_2 = Date.now();

    times.push(time_2 - time_1);
    data = null;
  };

  const n = times.length
  const mean = times.reduce((a, b) => a + b) / n
  const std = Math.sqrt(
    times
      .map(x => Math.pow(x - mean, 2))
      .reduce((a, b) => a + b) / n
  );

  return `${mean.toFixed(2)} ms ±${std.toFixed(3)} ms`;
};