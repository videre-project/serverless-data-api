import collection from './_collection.js';


export const name = 'sets';
export const description = 'A JSON file of MTGJSON set data.';

export default async (req, res) =>
    await collection(req, res, { name, description });