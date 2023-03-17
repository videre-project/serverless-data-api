import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

import catalog from './_catalog.js';
import collection from './_collection.js';

import { ARTIFACTS_DIR } from '../../scripts/build/constants.js';


export const DATA_PATH = join(process.cwd(), 'api/data');

/**
 * List of collection files.
 */
export const files = readdirSync(ARTIFACTS_DIR, { withFileTypes: true })
  // Exclude files and symbolic links from search
  .filter(d => d.isDirectory() && !d.isSymbolicLink())
  // Convert dirents to filepaths
  .map(d => join(DATA_PATH, `${d.name}.js`))
  // Filter for valid collection directories
  .filter(s => s.length > ARTIFACTS_DIR.length && existsSync(s));

/**
 * Object-array of collection metadata and directory scripts.
 */
export const collectionsMap = await Promise.all(
  // Build object for each directory.
  files
    .map(async (f) => {
      // Return collection metadata and directory scripts
      const { default: _, indexes, ...metadata } = await import(f);
      const fetchCatalog = () => catalog(metadata);

      return { metadata, indexes, fetchCatalog };
    })
);

export default async (req, res) => {
  // Handle serving a single collection
  if (req.url !== '/api/data') return await collection(req, res);

  let errors = [];
  const catalogs = await Promise.all(
    collectionsMap
      .map(async ({ fetchCatalog }) => {
        const { status, message, data } = fetchCatalog();
        if (status !== 'success') errors.push({ status, message });

        return data;
      })
      .filter(Boolean)
  );

  return res.send({
    ...(!errors.length
      ? { status: 'success', message: null }
      : { status: 'error', message: errors.map(({ message }) => message) }
    ),
    data: catalogs
  });
};