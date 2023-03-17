import { comma, obrace, cbrace, colon, mark, backslash } from './constants.js';
import { char, isMatch, findEnd } from './index.js';

/**
* Extract the value of `keys` in the json `buf`.
*
* If `keys` is a single key, returns the value.
*
* If `keys` is an array of keys, returns an array of values.
*
* @param {Buffer} buf
* @param {Array|String} keys
* @return {Mixed}
*/
export default function extract_key(buf, keys, indexed=true, asdict=false) {
  // Sort keys alphabetically
  const multi = Array.isArray(keys);
  keys = multi ? keys.sort() : [keys];

  // Converts keys to an array of char codes.
  const chars = keys.map(key => [...key].map(char));
  const key_idx = {};
  if (indexed) {
    // Use __sortIndex__ attr to skip unnecessary buffer scans in sorted arrays.
    const sortIndex = extract_key(buf, '__sortIndex__', false);
    // Create key index for jumping across buffer regions in memory
    keys.forEach((k,j) => { key_idx[j] = sortIndex[''+chars[j][0]][0]; });
  };
  
  // index of key search
  let j = 0;
  // level bitmap proxy
  let isKey = true;
  let inString = false;
  let level = 0;
  // search values
  let c; 
  const values = [];
  for (let i = key_idx[0] ?? 0; i < buf.length; ++i) {
    c = buf[i];
    
    // Skip to next character if current character escapes/delimits a string.
    if (c === backslash) { ++i; continue; }
    else if (c === mark) { inString = !inString; continue; }
    // Check if previous characters delimit a key or a new tree level.
    else if (!inString) {
      if (c === colon) isKey = false;
      else if (c === comma) isKey = true;
      else if (c === obrace) ++level;
      else if (c === cbrace) --level;
    };

    // Skip until the next key or tree level
    if (!isKey || level > 1) continue;
    // Search for matches for each key
    else if (!isMatch(buf, i, chars[j])) continue;

    // Extract value within matched index range.
    const a = i + keys[j].length + 2;
    const b = findEnd(buf, a);
    values[asdict && keys[j] || j] = JSON.parse(buf.subarray(a,b));

    // End search when all values are found; otherwise iterate to next key.
    if (j+1 === keys.length) break; else ++j;

    // Apply sortIndex optimization to avoid oversearching.
    if (indexed && keys[j-1][0] !== keys[j][0]) i = key_idx[j];
  };

  return multi ? values : values[0];
};