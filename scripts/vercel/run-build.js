import chalk from 'chalk';

import _prebuild from "../build/_prebuild.js";
import _build from "../build/_build.js";
import _postbuild from "../build/_postbuild.js";
import { ARTIFACTS_DIR } from '../build/constants.js';

import { formatTime } from '../../src/utils/formatting.js';
import log from '../../src/utils/log.js';


export default async () => {
  // let a = Date.now(); // Build start time.

  // log({ label:false }, '\n---- Starting pre-build step ----\n');
  // await _prebuild();
  // log({ label:false }, '\n---- Starting build step ----\n');
  // await _build();
  // log({ label:false }, '\n---- Starting post-build step ----\n');
  await _postbuild();

  // log({ label:false }, '\n---- Build Summary ----\n');
  // log({ label:false }, chalk.grey('Total build time:'),
  //     `${formatTime(Date.now() - a)}.`);
  // log({ label:false }, chalk.grey('Total build size:'),
  //     '?? MB');
  
  // process.env['BUILD_LOGGING'] = 'false';
}