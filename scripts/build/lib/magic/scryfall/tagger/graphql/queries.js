import { fetch } from 'undici';

import { GRAPHQL_PATH } from './constants.js';
import { TEMPLATE_SearchTags, TEMPLATE_FetchTag } from './templates.gql.js';


/**
 * Expose Tagger GraphQL 'SearchTags' method.
 */
export async function SearchTags({ page = 1, headers }) {
  const response = await fetch(GRAPHQL_PATH, {
    'method': 'POST',
    'body': JSON.stringify({
      "operationName": "SearchTags",
      "variables": {
        input: {
          name: null,
          page,
          type: 'ORACLE_CARD_TAG'
        }
      },
      "query": TEMPLATE_SearchTags
    }),
    'headers': headers,
  });
  if (!response.ok) throw new Error(response.statusText);

  return (await response.json());
};

/**
 * Expose Tagger GraphQL 'FetchTag' method.
 */
export async function FetchTag({ page = 1, slug, headers }) {
  const response = await fetch(GRAPHQL_PATH, {
    'method': 'POST',
    'body': JSON.stringify({
      "operationName": "FetchTag",
      "variables": {
        descendants: true,
        page,
        slug,
        type: "ORACLE_CARD_TAG",
      },
      "query": TEMPLATE_FetchTag
    }),
    'headers': headers,
  });
  if (!response.ok) throw new Error(response.statusText);

  return (await response.json());
};