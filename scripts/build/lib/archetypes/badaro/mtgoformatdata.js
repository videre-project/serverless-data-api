import { join } from 'path';

import fs from 'fs-extra';
import { clone } from 'isomorphic-git';
import http from 'isomorphic-git/http/node/index.cjs';

import { ARTIFACTS_DIR } from '../../../constants.js';

import { crawl } from '../../../../../src/utils/filesystem.js';

/**
 * Parses archetype data based on rules-based schema.
 */
async function parseArchetype(filepath, json=null) {
  try { json = await fs.readJSON(filepath); }
  catch (e) { /*console.log(e.message)*/ };
  if (!json) return {};

  // Read & parse json data
  const { Name, Conditions, ...rest } = json;
  
  // Fix archetype names
  const name = Name
    // Handle camelCase archetype names
    ?.replace(/([a-z])([A-Z])/g, '$1 $2')
    ?.replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
    ?.replace(/^./, (str) => str?.toUpperCase())
    // Hyphenate 'Mono' in name
    ?.replace(/(?<=^Mono)\s+/g, '-')
    // Remove excess whitespace
    ?.trim();

  if (!Conditions) return { name, rules: { ...rest } };

  // Regroup cards based on condition
  const condition_types = Conditions
    .map(({ Type }) => Type)
    // Filter unique condition types
    .filter((v, i, a) => a.indexOf(v) === i);

  const groups = condition_types
    .map(t => {
      const cards = Conditions
        .filter(({ Type }) => Type === t)
        .map(({ Cards }) => Cards)
        .flat(1)
        // Filter unique card names
        .filter((v, i, a) => a.indexOf(v) === i);
      
      return { [t]: cards };
    }) // Create object array from [key]: value map.
    .reduce((a, b) => {
      var key = Object.keys(b)[0];
      a[key] = b[key];
      return a;
    }, {});

  return { name, rules: { ...groups, ...rest } };
};


/**
 * Fetches all archetype rules.
 */
export async function getArchetypes() {
  const tempdir = join(ARTIFACTS_DIR, '/archetypes/.temp');

  // Clone remote
  await clone({
    fs,
    http,
    tempdir,
    url: `https://github.com/Badaro/MTGOFormatData`,
    ref: 'main',
    singleBranch: true,
    depth: 1,
  });

  // Group files based on format directory
  const formats = (await fs.readdir(`${tempdir}/Formats/`, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory() && dirent.name !== 'Unspecified')
    .map(dirent => dirent.name);
  
  const data = (await Promise.all(
    formats
      .map(async f => {
        const archetypes = await Promise.all(
          // Crawl and parse format rules
          (await crawl(tempdir, /\.json$/))
            .filter(filepath => {
              const [format] = filepath
                ?.match(/(?<=\/Formats\/).*(?=\/[Archetypes|Fallbacks]+\/)/g)
                ?? [];
              return format === f;
            })
            .map(parseArchetype)
        );

        return { [f]: archetypes };
      })
  )).reduce((a, b) => {
      const key = Object.keys(b)[0];
      a[key] = b[key];
      return a;
    }, {});

  // Cleanup temp dir
  fs.rmSync(tempdir, { recursive: true, force: true });

  return data;
};

export default getArchetypes;