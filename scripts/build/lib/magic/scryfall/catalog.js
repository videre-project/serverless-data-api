import { fetch } from 'undici';

import { ignoredLayouts, ignoredSetTypes } from './constants.js';


/**
 * Filters non-sanctioned card entries and null card properties.
 */
export function filterCatalog(catalog) {
  return catalog
    .filter(
      card =>
        // Return only valid card objects
        (card.name && card.set)
        // Remove null card object placeholders for back-halves of double-faced cards.
        && !(card.layout != 'normal' && !card.oracle_text && !card.power && !card.loyalty)
        // Exclude extraneous card layouts and set types from non-sanctioned formats
        && !ignoredLayouts.includes(card.layout)
        && !ignoredSetTypes.includes(card.set_type)
        // Exclude new cards from previews / etc not yet legal.
        && !(
          card.legalities.future == 'legal' &&
          Object.values(card.legalities).filter(x => x == 'legal').length == 1
        )
      // Alphabetical sort data by cardname
    ).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Fetches bulk cards data from Scryfall.
 */
export async function fetchBulkData(catalog_uri) {
  // Get Scryfall oracle catalog data
  const response = await fetch(catalog_uri);
  if (!response.ok) throw new Error(response.statusText);

  const catalog = (await response.json());
  return filterCatalog(catalog);
};

export default fetchBulkData;