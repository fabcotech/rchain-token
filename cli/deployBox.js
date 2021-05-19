const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');

const { deployBoxTerm } = require('../src/');
const waitForUnforgeable = require('./waitForUnforgeable').main;

const { log, validAfterBlockNumber, prepareDeploy, getMasterRegistryUri, getBoxId } = require('./utils');

module.exports.deployBox = async () => {
  if (typeof process.env.BOX_ID === 'string') {
    console.log('Please remove BOX_ID=* line in .env file');
    process.exit();
  }

  const masterRegistryUri = getMasterRegistryUri();
  const boxId = getBoxId();
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

  const term = deployBoxTerm({ masterRegistryUri: masterRegistryUri, boxId: boxId });
  log('✓ prepare deploy');

  const deployOptions = await rchainToolkit.utils.getDeployOptions(
    'secp256k1',
    timestamp,
    term,
    process.env.PRIVATE_KEY,
    publicKey,
    1,
    1000000,
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
  if (data.status !== "completed") {
    console.log(data);
    process.exit();
  }
  let envText = fs.readFileSync('./.env', 'utf8');
  envText += `\nBOX_ID=${boxId}`;
  fs.writeFileSync('./.env', envText, 'utf8');
  log('✓ deployed and retrieved data from the blockchain');
  log(`✓ updated .env file with BOX_ID=${boxId}`);
  console.log(`box id    : ${boxId}`);
};
