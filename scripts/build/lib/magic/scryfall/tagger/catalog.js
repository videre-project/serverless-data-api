/**
 * Flatten tagger entries to match tagger database schema.
 */
function flattenTaggerEntries(self) {
  // Create list of unique cards by oracleId and name.
  const uniqueCards = [...new Set(
    self.flatMap(({ taggings }) =>
      taggings.map(({ uid, name }) => ({ uid, name })))
    // Stringify objects as identical objects are
    // treated as different in JS because of
    // different memory references.
    .map(JSON.stringify)
  )].map(JSON.parse);

  return {
    tags: self.map(({ taggings, ...rest}) => rest),
    cards: uniqueCards.map(({ uid, name }) => ({
      uid,
      name,
      tags: self.map(({ uid: _uid, name: _name, taggings }) =>
        taggings
          .filter(({ uid: id }) => id == uid)
          .map(({ uid, name, ...rest }) => ({
            uid: _uid,
            name: _name,
            ...rest
          }))
      ).filter(obj => obj.length)
      .flat(2)
    }))
  };
};

/**
 * Parse tagger results into a monolithic catalog.
 */
export function formatTaggerCatalog(data, taggings) {
  // Get list of card uids
  const cards = Object.values(taggings)
    .flat(2)
    .map(({ uid }) => uid);

  // Combine results under a monolitic object array.
  const array = data
    .map(({ uid, ancestry, childTags, ...rest }) => ({
      uid,
      ...rest,
      count: (taggings?.[uid] || [])?.length,
      exclusive: (taggings?.[uid] || [])
        // Filter for cards within this tagging
        // that are only listed as tagged once.
        ?.filter(({ uid }) =>
          cards
            .filter(_uid => _uid == uid)
            ?.length == 1
        )?.length,
      ancestry: ancestry
        ?.map(({ tag: { id } }) => id)
        // Keep only references to previous uids.
        ?.filter(id => id !== uid),
      childTags: childTags
        ?.map(({ id }) => id),
      taggings: taggings?.[uid] || []
    })).filter(({ taggings }) => taggings?.length);

  return flattenTaggerEntries(array);
};

export default formatTaggerCatalog;