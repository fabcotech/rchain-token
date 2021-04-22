const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');

const { mainTerm } = require('../src/');
const waitForUnforgeable = require('./waitForUnforgeable').main;
const {
  log,
  validAfterBlockNumber,
  prepareDeploy,
  getFungible,
  getDepth,
  getName,
  logData,
  getBoxRegistryUri,
} = require('./utils');

module.exports.deploy = async () => {
  if (typeof process.env.REGISTRY_URI === 'string') {
    console.log('Please remove REGISTRY_URI=* line in .env file');
    process.exit();
  }
  const boxRegistryUri = getBoxRegistryUri();
  const fungible = getFungible();
  const depth = getDepth();
  const name = getName();
  console.log(
    `Will deploy a\x1b[36m`,
    fungible ? 'fungible' : 'non-fungible',
    '\x1b[0mtokens contract'
  );
  const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(
    process.env.PRIVATE_KEY
  );

  const timestamp = new Date().getTime();
  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const pd = await prepareDeploy(
    process.env.READ_ONLY_HOST,
    publicKey,
    timestamp
  );

  const term = mainTerm(boxRegistryUri, {
    fungible: fungible,
    name: name,
    depth: depth,
    fee: null,
  });

  //  .replace('/*DEFAULT_BAGS_IDS*/', defaultBagsIdsRholang)
  //   .replace('/*DEFAULT_BAGS*/', defaultBagsRholang)
  //   .replace('/*DEFAULT_BAGS_DATA*/', defaultBagsDataRholang);

  log('✓ prepare deploy');

  const deployOptions = await rchainToolkit.utils.getDeployOptions(
    'secp256k1',
    timestamp,
    term,
    process.env.PRIVATE_KEY,
    publicKey,
    1,
    10000000,
    vab || -1
  );

  try {
    const deployResponse = await rchainToolkit.http.deploy(
      process.env.VALIDATOR_HOST,
      deployOptions
    );
    if (!deployResponse.startsWith('"Success!')) {
      log('Unable to deploy');
      console.log(deployResponse);
      process.exit();
    }
  } catch (err) {
    log('Unable to deploy');
    console.log(err);
    process.exit();
  }
  log('✓ deploy');

  let dataAtNameResponse;
  try {
    dataAtNameResponse = await waitForUnforgeable(JSON.parse(pd).names[0]);
  } catch (err) {
    log('Failed to parse dataAtName response', 'error');
    console.log(err);
    process.exit();
  }
  const data = rchainToolkit.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );
  let envText = fs.readFileSync('./.env', 'utf8');
  envText += `\nREGISTRY_URI=${data.registryUri.replace('rho:id:', '')}`;
  fs.writeFileSync('./.env', envText, 'utf8');
  log('✓ deployed and retrieved data from the blockchain');
  log(
    `✓ updated .env file with REGISTRY_URI=${data.registryUri.replace(
      'rho:id:',
      ''
    )}`
  );
  logData(data);
};
