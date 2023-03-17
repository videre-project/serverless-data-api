import { appendFileSync, unlinkSync } from 'fs';
import { join } from 'path';

import chalk from 'chalk';
import glob from 'glob';

import { formatTime } from './formatting.js';
import suppressExperimental, { suppressWarnings } from './internal/suppress-experimental.js';


export function formatDurationString(a, b=Date.now()) {
  if (!a) { return; } else { return chalk.grey(`took ${formatTime(b - a)}.`); }
};

export const removeANSI = (string) =>
  string
    .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

export default function log({ color='grey', label, indent=false }, ...args) {
  const msg = label
    ? !indent
      ? chalk.bold[color](`[${label}]`)
      : Array(`[${label}]`.length).fill(' ').join('')
        + ((isFinite(indent) && indent >= 0)
          ? Array(2*indent).fill(' ').join('')
          : '')
    : typeof(label) !== 'boolean' && chalk.grey('-->');

  const timestamp = (new Date()).toISOString();
  const logged = [msg, ...args].filter(l => Boolean(l) !== false).join(' ');
  console.log(logged); // Logs output to console

  if (process.env['BUILD_LOGGING'] !== 'false') {
    appendFileSync(
      join(process.cwd(), 'artifacts', 'build.log'),
      removeANSI(`${timestamp}    ${logged.replace('\n',`\n${timestamp}    `)}\n`)
    );
  }

  
  return Date.now();
};

if (process.env['BUILD_LOGGING'] === 'true') {
  process.stdout.write('\x1Bc'); // Clear console.
  // Remove previous logs on initialization
  glob.sync(join(process.cwd(), 'artifacts', '**', '*.@(log|log.txt)'))
    .forEach(f => unlinkSync(f));
  suppressExperimental();
} else {
  suppressWarnings();
}