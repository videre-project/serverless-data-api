import chalk from 'chalk';

import { setDelay, dynamicSortMultiple } from '@videre/database';

import { SearchTags, FetchTag } from './graphql/queries.js';

import formatTaggerCatalog from './catalog.js';
import { TAGGER_PATH } from './constants.js';
import { formatTags } from './tags.js';

import { getApiCallHeaders } from '../../../../../../src/utils/internal/puppeteer/headers.js';

import log, { formatDurationString } from '../../../../../../src/utils/log.js';


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

/**
 * Get Scryfall Tagger tags metadata w/ taggings.
 */
export async function getTagsData(page) {
  // Extract session headers/cookie from tagger website.
  const headers = await getApiCallHeaders(page, TAGGER_PATH);
  await page.close();
  if (headers['X-CSRF-Token']) log({},
    chalk.yellow('Note:'),
    'Tagger session headers were',
    `${!headers ? `${chalk.underline('not')} found` : 'found'}.`
  );

  let json = await SearchTags({ headers });

  const { perPage, total, results } = json.data.tags;
  const num_pages = Math.ceil(total / perPage);
  let a = log({ label:false },
    `    Found ${num_pages} ${num_pages === 1 ? 'page' : 'pages'}.`
  );

  // Enumerate tag pages
  let data = [results];
  let _current = 0; let _prev = 0;
  for (let i = 0; i < num_pages; i++) {
    _current = (i+1)/num_pages;
    if ((!i) || (_current - _prev >= 5e-2) || _current === 1) {
      if (i) _prev = _current;
      const percent = `${(_current*100).toFixed(2)}%`;
      log({ label:'B', indent:1 },
        `Fetching page ${i+1} of ${num_pages} (${percent})...`
      );
    };
    await setDelay(100);
    json = await SearchTags({ page: i + 1, headers });
    data.push(json.data.tags.results);
  };
  log({},formatDurationString(a));

  // Format tag metadata.
  data = formatTags(data);
  await setDelay(100);
  let b = log({ label:false },
    `    Recovered ${data?.length} valid ${ total === 1 ? 'tag.' : 'tags.' }`,
  );

  // Enumerate card tagging pages.
  let _taggings = {};
  _current = 0; _prev = 0;
  for (let i = 0; i < data.length; i++) {
    _current = (i+1)/data.length;
    if ((!i) || (_current - _prev >= 5e-2) || _current === 1) {
      if (i) _prev = _current;
      const percent = `${(_current*100).toFixed(2)}%`;
      log({ label:'B', indent:1 },
        `Fetching tag ${i+1} of ${data.length} (${percent})...`
      );
    };

    let { name: slug } = data[i];
    json = await FetchTag({ slug, headers });

    let { perPage: _perPage, total: _total } = json.data.tag.taggings;
    num_pages = Math.ceil(_total / _perPage);

    // Enumerate tagging pages.
    let _data = [json.data.tag.taggings];
    for (let i = 1; i < num_pages; i++) {
      await setDelay(100);
      json = await FetchTag({ page: i + 1, slug, headers });
      _data.push(json.data.tag.taggings.results);
    };

    // Create a tag id key with each card ref
    _taggings[json.data.tag.id] = _data
      .flat(1)
      .filter(({ status }) =>
        status === 'GOOD_STANDING'
      ).map(({ card, id, status, ...rest }) => ({
        uid: card.oracleId,
        name: card.name,
        taggingId: id,
        ...rest
      }));
  };
  log({},formatDurationString(b));

  // Combine results under a unified object array.
  let c = log( { label:'Build' }, 'Formatting tagger catalog...')
  const tagData = formatTaggerCatalog(data, _taggings);
  log({},formatDurationString(c));

  log({ label:'Build' }, 'Finished building Scryfall Tagger data.');
  return tagData;
}

export default getTagsData;