const rchainToolkit = require('rchain-toolkit');
const uuidv4 = require('uuid/v4');

const { updatePursePriceTerm } = require('../src');

const {
  log,
  validAfterBlockNumber,
  getBoxId,
  getContractId,
  getMasterRegistryUri,
  getProcessArgv,
} = require('./utils');

module.exports.updatePursePrice = async () => {
  const masterRegistryUri = getMasterRegistryUri();
  const contractId = getContractId();
  const boxId = getBoxId();

  const purseId = getProcessArgv('--purse-id');
  if (typeof purseId !== "string") {
    throw new Error('Missing arguments --purse-id');
  }

  const price = getProcessArgv('--price')
    ? parseInt(getProcessArgv('--price'), 10)
    : undefined;

  const term = updatePursePriceTerm({ masterRegistryUri, boxId, contractId, price, purseId });

  const timestamp = new Date().getTime();
  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const deployOptions = await rchainToolkit.utils.getDeployOptions(
    'secp256k1',
    timestamp,
    term,
    process.env.PRIVATE_KEY,
    rchainToolkit.utils.publicKeyFromPrivateKey(process.env.PRIVATE_KEY),
    1,
    1000000,
    vab
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
  log('✓ deployed');
};
