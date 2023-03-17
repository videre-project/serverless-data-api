import collection from './_collection.js';


export const name = 'cards';
export const description = 'A JSON file of oracle Scryfall card objects with pricing data.';

export const indexes = {
  base: { by: 'name', on: ['uid'] }
};

export default async (req, res) =>
  await collection(req, res, { name, description });