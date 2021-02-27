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
  if (Object.keys(data.purses).length === 0) {
    console.log(`\nNo purses`);
  }
  if (Object.keys(data.purses).length > 0) {
    console.log(`\nPurses :`);
    Object.keys(data.purses).forEach((k) => {
      console.log(`  Registry URI (contract) : ${k.replace('rho:id:', '')}`);
      console.log(`    purses IDs: ${data.purses[k].join(', ')}`);
    });
  }
  console.log('\n');
  return;
};
