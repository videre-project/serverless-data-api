// import { pruneObjectKeys } from '@videre/database';
import { pruneObjectKeys } from '../../../../src/utils/database.js';

import { ignoredSetTypes } from './scryfall/constants.js';

import { FORMATS } from './constants.js';


/**
 * Format cards collection into cards database schema.
 */
export function formatCardObjects(self, setData) {
  return self
    .map(card => pruneObjectKeys({
      // Evergreen Properties
      uid: card.oracle_id,
      name: card.name,
      colors: card?.colors
        // Assign cards like lands proper colorless ('C') color.
        ? (!card.colors.length ? [ 'C' ] : card.colors)
        : card.card_faces
          .flatMap(face => face.colors.length ? [ 'C' ] : face.colors)
          // Remove duplicate colors (e.g. ['R','G','R']).
          .filter((item, pos, self) => self.indexOf(item) == pos),
      color_identity: (!card.color_identity.length)
        ? [ 'C' ]
        : card.color_identity,
      produced_mana: card?.produced_mana,
      cmc: card?.cmc,
      mana_cost: card?.mana_cost,
      power: card?.power
        ? card.power
        : (card?.card_faces ? card.card_faces.map(face => face.power) : null),
      toughness: card?.toughness
        ? card.toughness
        : (card?.card_faces ? card.card_faces.map(face => face.loyalty) : null),
      loyalty: card?.loyalty
        ? card.loyalty
        : (card?.card_faces ? card.card_faces.map(face => face.loyalty) : null),
      // May change per errata/oracle updates
      typeline: card?.type_line,
      supertypes: card?.supertypes,
      types: card?.types,
      subtypes: card?.subtypes,
      oracle_text: [
        card?.oracle_text,
        ...(card?.card_faces?.map(face => face.oracle_text) || [])
      ],
      layout: card.layout,
      keywords: card?.keywords,
      // May update per B&R announcement (Mon ~16:00 UTC)
      legalities: Object.fromEntries(
        FORMATS.map(format => [format, card.legalities[format] || 'not_legal'])
      ),
      // May update per new set release
      printings: Object.fromEntries([
          ['latest', {
            set_id: card?.set_id,
            set: (card?.set || null).toUpperCase(),
            card_id: card.id,
            card_number: card.collector_number,
            artist: card.artist,
            image: card.image_uris.normal,
            scryfall_uri: card.scryfall_uri.replace(/\?utm_source.*$/,''),
            // May update daily (~03:30 UTC)
            prices: card?.prices,
          }],
          // Add list of all sets by set type
          ...[...new Set(
            // Create unique set of printings (set codes).
            [...new Set(card?.printings)]
              .filter(Boolean)
              .map(_id =>
                // Map all unique matching set types.
                setData
                  .filter(obj => obj.id == _id)
                  ?.[0]
                  ?.type
              ).sort()
            // Ignore all specialty/extra set types.
          )].filter(type =>
            type?.length && !ignoredSetTypes.includes(type)
            // Map each unique key-value pair for `type: [sets]`.
          ).map(type => [type,
            [...new Set(card?.printings)]
              .map(_id =>
                setData
                  .filter(obj => obj.id == _id && obj.type == type)
                  // Sort sets by release date in descending order.
                  .sort((a, b) => (new Date(a.date) < new Date(b.date) ? 1 : -1))
                  ?.[0]
                  ?.id
              ).filter(Boolean)
          ])
      ]),
      // May update daily (~03:30 UTC)
      tagger: card?.tags
        ? [...new Set(
          card.tags
            .sort((a, b) => (a.count < b.count ? 1 : -1))
            .map(({ uid, name }) => uid || name)
        )]
        : [],
    }));
};

export default formatCardObjects;