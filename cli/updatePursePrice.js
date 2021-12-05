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
  let deployResponse;
  try {
    deployResponse = await rchainToolkit.http.easyDeploy(
      process.env.VALIDATOR_HOST,
      term,
      process.env.PRIVATE_KEY,
      1,
      10000000
    );
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
  if (!deployResponse.startsWith('"Success!')) {
    log('Unable to deploy');
    console.log(deployResponse);
    process.exit();
  }
  log('✓ deployed');
};
