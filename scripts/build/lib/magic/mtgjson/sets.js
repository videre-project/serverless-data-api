import { fetch, setGlobalDispatcher, Agent } from 'undici';

import { ignoredSetTypes } from '../scryfall/constants.js';

import formatSetObjects from '../sets.js';
import { API_PATH } from './constants.js';


/**
 * Filter MTGJSON set data to include sets only matching from a card catalog.
 */
function filterSetObjects(set_catalog, card_catalog) {
  return set_catalog
    .filter(({ id }) =>
      [...new Set(card_catalog.flatMap(obj => obj.printings))]
        .includes(id)
    ).sort((a, b) => (new Date(a.date) < new Date (b.date) ? 1 : -1));
};


/**
 * Get MTGJSON set data.
 */
export async function getSetData(card_catalog) {
  // Sets max timeout for MTGJSON requests.
  setGlobalDispatcher(new Agent({ connect: { timeout: 60_000 }, }));

  const response = await fetch(`${API_PATH}SetList.json`);
  if (!response.ok) throw new Error(response.statusText);

  const set_catalog = (await response.json()).data;
  const uniqueSets = [...new Set(set_catalog)];
  const data = formatSetObjects(uniqueSets);

  const sets = filterSetObjects(data, card_catalog)
    .filter(({ type }) => !ignoredSetTypes.includes(type));
  
  return sets;
};

export default getSetData;