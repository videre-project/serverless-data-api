import { readdirSync, rmSync } from 'fs';

import chalk from 'chalk';

import { ARTIFACTS_DIR } from './constants.js';

import log, { formatDurationString } from '../../src/utils/log.js';

export const remove_artifacts = () => {
  let a = log({ color:'blue', label:'Pre-build' }, `Removing build artifacts...`);
  const files = readdirSync(ARTIFACTS_DIR);
  files.forEach(f => rmSync(`${ARTIFACTS_DIR}/${f}`, { recursive: true }));
  log({}, chalk.yellow('Note:'),
    `Removed ${files.length} ${files.length === 1 ? 'artifact' : 'artifacts'}.`);
  log({},formatDurationString(a));
}

/**
 * Runs pre-build scripts
 */
 export default async () => {
  // Handle pre-build configuration
  remove_artifacts();
};