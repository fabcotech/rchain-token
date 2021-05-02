const rchainToolkit = require('rchain-toolkit');

const { readBoxTerm } = require('../src');

module.exports.viewBox = async () => {
  if (typeof process.env.BOX_REGISTRY_URI !== 'string') {
    console.log('BOX_REGISTRY_URI=* not found in .env file');
    process.exit();
  }

  const boxRegistryUri = process.env.BOX_REGISTRY_URI;

  const term0 = readBoxTerm(boxRegistryUri);
  const result0 = await rchainToolkit.http.exploreDeploy(
    process.env.READ_ONLY_HOST,
    {
      term: term0,
    }
  );
  const data = rchainToolkit.utils.rhoValToJs(JSON.parse(result0).expr[0]);
  console.log(
    `Registry URI (box)    : ${data.registryUri.replace('rho:id:', '')}`
  );
  if (Object.keys(data.superKeys).length > 0) {
    console.log(`\nSuper keys :`);
    data.superKeys.forEach((sk) => {
      console.log(`  Registry URI (contract) : ${sk.replace('rho:id:', '')}`);
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
        console.log('\x1b[34m', `  Registry URI (contract)`, '\x1b[0m', ` : ${k.replace('rho:id:', '')}`)
        console.log('\x1b[34m', `  Purses IDs 0-99/${data.purses[k].length}`,'\x1b[0m', `: ${data.purses[k].slice(0,100).join(', ')}`);
      } else {
        console.log('\x1b[34m', `  Registry URI (contract)`, '\x1b[0m', ` : ${k.replace('rho:id:', '')}`)
        console.log('\x1b[34m', `    Purses IDs 0-${data.purses[k].length - 1}`, '\x1b[0m', `: ${data.purses[k].join(', ')}`);
      }
    });
  }
  console.log('\n');
  return;
};
