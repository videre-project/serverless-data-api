import { dynamicSortMultiple } from '../../../../../../src/utils/database.js';


export function formatTaggerObjects(card_catalog, tags_list) {
  const unique_tags = [...new Set(
    card_catalog
      .filter(({ tags }) => tags?.length)
      ?.map(({ tags }) => tags.map(({ uid }) => uid))
      ?.flat(2)
  )];
  const tagData = tags_list
    ?.filter(({ uid }) => unique_tags.includes(uid))
    ?.sort(dynamicSortMultiple('count', 'unique', 'displayName'));

  return tagData;
}

export default formatTaggerObjects;