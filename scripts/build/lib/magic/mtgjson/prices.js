// For request streaming
import request from 'request';
import JSONStream from 'JSONStream';
import es from 'event-stream';

import { API_PATH } from './constants.js';

/**
 * Flatten price data
 */
export function flatten_prices(value) {
  Object.keys(value)
  .forEach(game => { // 'paper' or 'mtgo'
    Object.keys(value[game])
      .forEach(vendor => { // e.g. 'tcgplayer'
        if (game == 'mtgo') value[game][vendor].currency = 'TIX';
        Object.keys(value[game][vendor])
          .filter(kind => kind !== 'currency')
          .forEach(kind => { // 'buylist' or 'retail'
            Object.keys(value[game][vendor][kind])
              .forEach(finish => { // e.g. 'normal' or 'foil'
                const price_history = value[game][vendor][kind][finish];
                const date = Object.keys(price_history)
                  .sort((a,b) => new Date(b) - new Date(a))[0];
                // Keep only current price
                value[game][vendor][kind][finish] = price_history[date];
              });
          });
      })
  });
  return value;
}

/**
 * Get MTGJSON 'atomic' data
 */
export async function getPriceData(data, printing_index) {
  // Update card entries with price info for each printing.
  await new Promise((resolve, reject) => {
    request({ url: `${API_PATH}AllPrices.json` })
      .pipe(JSONStream.parse('data.$*'))
      .on('end', resolve)
      .on('error', reject)
      .pipe(es.map(async ({ key, value }) => {
        if (!printing_index?.[key]) return;
        // Get price entry (has metadata only)
        const { idx, oid, set } = printing_index[key];
        const entry = data[oid].prices[set][idx];
        // Update price entry
        data[oid].prices[set][idx] = { ...entry, ...flatten_prices(value) };
      }));
  });

  return data;
}

export default getPriceData;