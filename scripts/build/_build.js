import { writeFileSync } from 'fs';
import { join } from 'path';

import chalk from 'chalk';

// Collection data
import getSetData from './lib/magic/mtgjson/sets.js';
import getMTGJSONData from './lib/magic/mtgjson/index.js';
import fetchBulkData from './lib/magic/scryfall/catalog.js';
import getTagsData from './lib/magic/scryfall/tagger/index.js';
import formatTaggerObjects from './lib/magic/tags.js';
import formatCardObjects from './lib/magic/cards.js';
// Archetypes data
import getBadaroArchetypes from './lib/archetypes/badaro/mtgoformatdata.js';

import getCurrentRevision from './expiry.js';


import { writeCollection } from '../../src/utils/internal/lz4/filesystem.js';
import { usePuppeteerStealth } from '../../src/utils/internal/puppeteer/stealth.js';
import { formatTime } from '../../src/utils/formatting.js';
import log, { formatDurationString } from '../../src/utils/log.js';


/**
 * Updates collection data objects.
 */
export async function updateCollectionData(download_uri, meta) {
  // Aggregate Scryfall card data w/ tagger metadata
  let b = log({ label:'Build' }, 'Fetching Scryfall bulk data...');
  let scryfall_data = await fetchBulkData(download_uri);
  log({},formatDurationString(b));

  // Aggregate MTGJSON card and set metadata
  let c = log({ label:'Build' }, 'Fetching MTGJSON card data...');
  const whitelist = scryfall_data.map(o => o.oracle_id);
  const mtgjson_data = await getMTGJSONData(whitelist);
  scryfall_data = scryfall_data
    .map(o => ({ ...(mtgjson_data?.[o.oracle_id] || {}), ...o }));
  log({},formatDurationString(c));

  let d = log({ label:'Build' }, 'Fetching MTGJSON set data...');
  const setData = await getSetData(scryfall_data);
  log({},formatDurationString(d));

  let e = log({ label:'Build' }, 'Fetching Scryfall Tagger data...');
  // const { _, page } = await usePuppeteerStealth({ headless: true });
  // const { tags, cards: taggings } = await getTagsData(page);
  // scryfall_data = scryfall_data
  //   .map(o => ({
  //     ...o,
  //     tags: taggings
  //       ?.filter(({ uid }) => uid == obj.oracle_id)?.[0]
  //       ?.tags,
  //   }));
  log({},formatDurationString(e));

  let f = log({ label:'Build' }, 'Compiling collection data...');
  const cardData = formatCardObjects(scryfall_data, setData);
  const priceData = Object.fromEntries(
    whitelist
      .filter(oid => mtgjson_data?.[oid]?.prices)
      .map(oid => [oid, mtgjson_data?.[oid]?.prices])
  );
  const tagData = {}//formatTaggerObjects(scryfall_data, tags);
  log({},formatDurationString(f));

  writeCollection(cardData, { meta, dir: 'cards', name: 'base' });
  writeCollection(priceData, { meta, dir: 'cards', name: 'prices' });
  writeCollection(tagData, { meta, dir: 'cards', name: 'tags' });
  writeCollection(setData,{ meta, dir: 'sets', name: 'base' });
};

export async function updateArchetypeData() {
  let a = log({ label:'Build' }, 'Compiling archetypes data...');
  const badaroData = await getBadaroArchetypes();
  log({},formatDurationString(a));
  writeCollection(badaroData,{ meta, dir: 'archetypes', name: 'badaro' });
}

/**
 * Runs build scripts
 */
export default async () => {
  let a = Date.now();

  // Write new build catalog
  const { expired, download_uri, ...meta } = await getCurrentRevision();
  writeFileSync(
    join(process.cwd(), 'artifacts', `${meta.timestamp}.catalog.json`),
    JSON.stringify(meta)
  );

  await updateCollectionData(download_uri, meta);
  await updateArchetypeData();

  log({ label:false },
    chalk.green('Success:'),
    `Finished updating build artifacts in ${formatTime(Date.now() - a)}.`
  );
};