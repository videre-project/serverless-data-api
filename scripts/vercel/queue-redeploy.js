import { fetch } from 'undici'

import { readCatalog } from './build/lib/lz4/filesystem.js';
import { getCurrentRevision } from './build/check-collections.js';

import { DEPLOYMENT_URL, VERCEL_API_URL, DATA_DIR } from './constants.js';


/**
 * Redeploy with re-built collection data if new data exists.
 */
export default async function queueRedeployment() {
  const catalog = readCatalog('collectionData');

  const { expired, ...rest } = await getCurrentRevision(catalog);
  if (expired !== data.revision) {
    const response = await fetch(DEPLOYMENT_URL, { method: 'POST' });
    const queue = await response.json();
    if (!response.ok) console.error(JSON.stringify(queue));

    return queue;
  };
};