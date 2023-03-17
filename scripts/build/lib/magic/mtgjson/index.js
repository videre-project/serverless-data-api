// For request streaming
import request from 'request';
import JSONStream from 'JSONStream';
import es from 'event-stream';

import { API_PATH } from './constants.js';
import getPriceData from './prices.js';


/**
 * Get MTGJSON 'atomic' data
 */
export async function getCardData(whitelist) {
  // Map card entries to unique printings metadata.
  let data = {};
  let printing_index = {};
  await new Promise((resolve, reject) => {
    request({ url: `${API_PATH}AllPrintings.json` })
      // .on('response', (response) => console.log(response.headers))
      .pipe(JSONStream.parse('data.*'))
      .on('end', resolve)
      .on('error', reject)
      .pipe(es.map(async ({ cards }) => {
        cards
          .filter(({ identifiers: { scryfallOracleId: oid } }) =>
            // Only whitelist cards with matching oracle ids.
            whitelist.includes(oid))
          .forEach(({
            // identity
            setCode: set, uuid: mtgjsonId,
            identifiers: { scryfallOracleId: oid, scryfallId: id },
            // atomic card props
            types, supertypes, subtypes, printings,
            // price specific metadata
            borderColor: border, frameEffects: frame_effects, finishes,
          }) => {
            // Populate card entry if none exists
            if (!data?.[oid])
              data[oid] = { types, supertypes, subtypes, printings, prices: {} };
            // Populate set (price) entry if none exists
            if (!data[oid].prices?.[set])
              data[oid].prices[set] = [];
            // Create index for mapping uuids to price entry
            const idx = data[oid].prices[set].length;
            printing_index[mtgjsonId] = { idx, oid, set };
            // Add printing entry for each set with price data
            data[oid].prices[set].push({
              scryfall_id: id, border, frame_effects, finishes,
              // Price data is appended to this entry later.
            });
          });
      }));
  });
  
  // Update card entries with price info for each printing.
  data = await getPriceData(data, printing_index);

  return data;
}

export default getCardData;