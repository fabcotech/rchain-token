const rchainToolkit = require('rchain-toolkit');

const { readBoxTerm } = require('../src');
const { getMasterRegistryUri } = require('./utils');

module.exports.viewBox = async () => {
  if (typeof process.env.BOX_ID !== 'string') {
    console.log('BOX_ID=* not found in .env file');
    process.exit();
  }
  const masterRegistryUri = getMasterRegistryUri();

  const boxId = process.env.BOX_ID;

  const term = readBoxTerm({ boxId, masterRegistryUri });

  const result0 = await rchainToolkit.http.exploreDeploy(
    process.env.READ_ONLY_HOST,
    {
      term: term,
    }
  );
  const data = rchainToolkit.utils.rhoValToJs(JSON.parse(result0).expr[0]);
  console.log(`Box id     : ${boxId}`);
  if (Object.keys(data.superKeys).length > 0) {
    console.log(`\nSuper keys :`);
    data.superKeys.forEach((sk) => {
      console.log(`  Contract : ${sk}`);
    });
  }
  const keys = Object.keys(data.purses);
  if (keys.length === 0) {
    console.log(`\nNo purses`);
  }
  if (keys.length > 0) {
    console.log(`\nPurses (${keys.length} contracts) :`);
    keys.forEach((k) => {
      if (data.purses[k].length > 99) {
        console.log('\x1b[34m', `  contract id`, '\x1b[0m', `      : ${k}`);
        console.log(
          '\x1b[34m',
          `  Purses IDs 0-99/${data.purses[k].length}`,
          '\x1b[0m',
          `: ${data.purses[k].slice(0, 100).join(', ')}`
        );
      } else {
        console.log('\x1b[34m', `  contract id`, '\x1b[0m', `      : ${k}`);
        console.log(
          '\x1b[34m',
          `    Purses IDs 0-${data.purses[k].length - 1}`,
          '\x1b[0m',
          `: ${data.purses[k].join(', ')}`
        );
      }
    });
  }
  console.log('\n');
  return;
};
