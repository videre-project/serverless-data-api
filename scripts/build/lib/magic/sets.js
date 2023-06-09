import { pruneObjectKeys } from '@videre/database';


/**
 * Format cards collection into cards database schema.
 */
export function formatSetObjects(self) {
  return self
    .map(set => pruneObjectKeys({
      // object: 'set',
      id: set.code,
      name: set.name,
      date: set.releaseDate,
      type: set.type,
      size: set?.baseSetSize || set?.totalSetSize,
    }));
};

export default formatSetObjects;