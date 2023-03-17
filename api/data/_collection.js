import { existsSync } from 'fs';
import { join } from 'path';

import { read_lz4_json } from '../../scripts/build/lib/lz4/json.js';

// import { getUUID } from '../../scripts/build/lib/lz4/filesystem.js';
import { ARTIFACTS_DIR } from '../../scripts/build/constants.js';


export const FILEPATH = (name, part) =>
  join(ARTIFACTS_DIR, name, `${part || 'base'}.compressed.lz4`);

export const catalogExists = (name, part) =>
  existsSync(FILEPATH(name, part));

export default async (req, res, metadata) => {
  const { name, description, indexes } = metadata;
  const { part, ...args } = req?.query ?? {};
  if (!catalogExists(name)) {
    return res
      .status(400)
      .send({
        status: 'error',
        message: `Collection name '${name}' does not exist.`,
        data: null
      });
  } else if (!catalogExists(name, part)) {
    return res
      .status(400)
      .send({
        status: 'error',
        message: `Collection part '${part}' under '${name}' does not exist.`,
        data: null
      });
  };

  // TODO: handle querybuilder data streaming for GraphQL and REST
  const data = await read_lz4_json(FILEPATH(name, part));
  
  return res.send(data);
};