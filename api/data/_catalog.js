import { readCatalog } from '../../scripts/build/lib/lz4/filesystem.js';

import { formatURI, formatTime } from '../../src/utils/formatting.js';


/**
 * Formats catalog metadata (used by `index.js` files for each data directory).
 */
export function formatCatalog(data, { name, description }) {
  const {
    timestamp,
    details: { id, type, cache_type, last_updated, updated_every, ...details },
    ...rest
  } = data;

  return {
    object: 'catalog',
    timestamp,
    ...rest,
    details: {
      id,
      name,
      description,
      type,
      cache_type,
      last_updated,
      updated_every: formatTime(updated_every),
      expired: Boolean(process.env['CATALOG_EXPIRY'] === 'true'),
      // TODO: add <id>.compressed.lz4 schema and update catalog checking
      uri: formatURI(name),
      ...details,
    },
  };
};

export default ({ name, description, cache_type, updated_every }) => {
  let t = Date.now();
  const output = readCatalog(name);
  
  if (!output?.timestamp) {
    return {
      status: 'error',
      message: `No compiled \'${name}\' catalog was found.`,
      data: null
    };
  };

  // Calculate human-friendly time-metrics
  const { timestamp, details: { last_updated, expired } } = output;
  const age = t - new Date(timestamp).getTime();
  const state = () => {
    const ms = (Date.now() - new Date(last_updated).getTime()) - updated_every;
    const remaining = formatTime(Math.abs(ms));
    
    return expired && 'and is currently expired'
      || ms < 0
        ? `and will expire in ${remaining}`
        : `and is pending recompilation since ${remaining} ago`;
  };

  return {
    status: 'success',
    message: [
      'Note:',
        `This collection was generated ${formatTime(age)} ago (${state()}).`,
        `Collection data is pulled from a ${cache_type} cache`,
          `and is recompiled once every ${formatTime(updated_every)},`,
          'which may not reflect recent upstream changes.'
    ].join(' '),
    data: formatCatalog(output, { name, description })
  };
};