const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');

const { masterTerm } = require('../src/');
const {
  log,
  getDepth,
  getContractDepth,
} = require('./utils');

module.exports.deployMaster = async () => {
  if (typeof process.env.MASTER_REGISTRY_URI === 'string') {
    console.log('Please remove MASTER_REGISTRY_URI=* line in .env file');
    process.exit();
  }

  const depth = getDepth() || 3;
  const contractDepth = getContractDepth() || 2;

  const term = masterTerm({
    depth: depth,
    contractDepth: contractDepth,
  });
  let dataAtNameResponse;
  try {
    dataAtNameResponse = await rchainToolkit.http.easyDeploy(
      process.env.VALIDATOR_HOST,
      term,
      process.env.PRIVATE_KEY,
      1,
      10000000,
      60 * 1000
    );
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
  log('✓ deploy');

  const data = rchainToolkit.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );
  let envText = fs.readFileSync('./.env', 'utf8');
  envText += `\nMASTER_REGISTRY_URI=${data.registryUri.replace('rho:id:', '')}`;
  fs.writeFileSync('./.env', envText, 'utf8');
  log('✓ deployed master and retrieved data from the blockchain');
  log(
    `✓ updated .env file with MASTER_REGISTRY_URI=${data.registryUri.replace(
      'rho:id:',
      ''
    )}`
  );
};
