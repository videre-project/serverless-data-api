import { TAG_PATH } from './constants.js';


/**
 * Reformat Tagger schema to a flat semi-structured schema.
 */
export function formatTags(self, filter = true) {
  return self
    .flat(1)
    .filter(({ status }) =>
      status === 'GOOD_STANDING'
    ).map(tag => ({
      uid: tag.id,
      name: tag.slug,
      displayName: tag.name,
      description: tag.description,
      type: tag.type == 'ORACLE_CARD_TAG'
        ? 'oracletag'
        : 'art',
      url: `${TAG_PATH}${tag.slug}`,
      category: tag.category,
      count: tag.taggingCount,
      ancestry: tag.ancestry,
      childTags: tag.childTags
    })).filter(obj => !filter || obj.category || obj.count > 1)
    .sort((a, b) => (a.count < b.count ? 1 : -1));
};