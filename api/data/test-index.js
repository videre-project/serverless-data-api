import { indexed_read } from './_indexes.js';

import fs from 'fs-extra';
import { join } from 'path';
import { ARTIFACTS_DIR } from '../../scripts/build/constants.js';
// import { readLz4 } from '../../src/utils/internal/lz4/index.js';
import { readLz4 } from '@src/utils/internal/lz4/index.js';

import lz4, { createEncoderStream, createDecoderStream } from 'lz4';


export default async (req, res) => {
  const dir = 'cards', file = 'base';
  const buf0 = await readLz4(join(ARTIFACTS_DIR, dir, `${file}.index.lz4`));
  const _json = JSON.parse(buf0);
  fs.writeFileSync('test.json', JSON.stringify(_json));

  // const encoder = createEncoderStream({ dict: true });
  // const input = fs.createReadStream('test.json');
  // const output = fs.createWriteStream('test.lz4');

  // input.pipe(encoder).pipe(output).on('close', () => Promise.resolve());

  // const input2 = fs.readFileSync('test.lz4');
  // const output2 = lz4.decode(input2, { dict: true });

  // fs.writeFileSync('test2.json', output2);

  // return res.send({ success: true });
  
  // const { cardname } = req?.query;
  // process.stdout.write('\x1Bc');

  // const cards = [
  //   'Flooded Strand',
  //   'Hallowed Fountain',
  //   'Island',
  //   'Mountain',
  //   'Otawara, Soaring City',
  //   // 'Sacred Foundry',
  //   // 'Scalding Tarn',
  //   // 'Spirebluff Canal',
  //   // 'Steam Vents',
  //   // 'Urza\'s Saga',
  //   // 'Mishra\'s Bauble',
  //   // 'Mox Amber',
  //   // 'Lightning Bolt',
  //   // 'Ragavan, Nimble Pilferer',
  //   // 'Unholy Heat',
  //   // 'Aether Spellbomb',
  //   // 'Springleaf Drum',
  //   // 'Ledger Shredder',
  //   // 'Thassa\'s Oracle',
  //   // 'Underworld Breach',
  //   // 'Expressive Iteration',
  //   // 'Grinding Station',
  //   // 'Emry, Lurker of the Loch',
  //   // 'Teferi, Time Raveler',
  //   // // Sideboard
  //   // 'Monastery Mentor',
  //   // 'Mystical Dispute',
  //   // 'Spell Pierce',
  //   // 'Fury',
  //   // 'Engineered Explosives',
  //   // 'Soul-Guide Lantern',
  //   // 'Shadowspear',
  //   // 'Pithing Needle',
  //   // //'Wear // Tear'
  // ];
  // const json = await indexed_read('cards', 'base', [cardname, ...cards]);
  
  // return res.send(json);
};