import { join } from 'path';

import { DATA_DIR as _DATA_DIR } from '../../../vercel/constants.js';

export const DATA_DIR = join(process.cwd(), ..._DATA_DIR.split('/'));