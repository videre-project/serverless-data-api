import chalk from 'chalk';
import { fetch } from 'undici';

import { API_PATH } from './magic/scryfall/constants.js';

import log, { formatDurationString } from '../../../src/utils/log.js';


export const cache_type = 'static';
export const updated_every = 12 * 3.6e+6; // hours -> ms

/**
 * Checks for expiry between any two catalog dates.
 */
function is_expired(a, b) {
  // Format date as timestamp integer
  const time = (a) => (a ? new Date(a) : new Date()).getTime();
  // Must have a defined, sequential relationship
  const condition2 = (time(b) > time(a)) && (time(b) - time(a)) > 0;
  // Difference must exceed that of it's collection interval
  const condition3 = updated_every <= (time(b) - time(a));
  return Boolean(condition2 && condition3);
};

/**
 * Gets the latest Scryfall oracle catalog.
 */
export default async (catalog) => {
  // Check if catalog is out of sync.
  log({ color:'blue', label:'Expiry' }, 'Syncing collection version...');
  if (catalog &&
    (is_expired(catalog?.timestamp) && is_expired(catalog?.details?.last_updated))
  ) log({}, chalk.yellow('Note:'), 'Collection interval is out of sync.');
  else log({}, chalk.yellow('Note:'), 'Collection interval is in sync.');

  // Check current scryfall bulk data version
  let b = log({ label:'Expiry' }, 'Fetching Scryfall bulk-data catalog...');
  const checked_at = Date.now();
  const response = await fetch(`${API_PATH}bulk-data`);
  if (!response.ok) throw new Error(response.statusText);
  // Get current catalog meta
  const { id, updated_at: U, download_uri } = (await response.json()).data
    ?.filter(({ type }) => type === 'oracle_cards')
    ?.[0];
  log({},formatDurationString(b));

  // Expire 12 hours after update time unless missing catalog data
  log({ label:'Expiry' }, 'Comparing version data for expiry...');
  const toISO = (timestamp) => (new Date(timestamp)).toISOString();
  const updated_at = new Date(U.replace('+00:00', 'Z')).getTime();
  const expired = !catalog // Always expire when missing catalog.
    // Check if oracle bulk data contents have changed.
    || is_expired(catalog?.details?.last_updated, updated_at)
    // Checks if scryfall's id for oracle bulk data has changed.
    || (catalog?.details?.id && catalog?.details?.id !== id);
  if (expired) log({}, chalk.yellow('Note:'), 'Collection was marked as expired.');
  log({ label: false }, ''); // Add linebreak to build script

  return {
    id,
    type: 'collection',
    content_type: 'application/json',
    encoding: 'utf-8',
    cache_type,
    updated_every,
    last_updated: toISO(updated_at),
    expired,
    download_uri,
    timestamp: toISO(checked_at),
  };
};