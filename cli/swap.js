const rchainToolkit = require('rchain-toolkit');

const { swapTerm } = require('../src/');

const {
  getNewId,
  getQuantity,
  getMasterRegistryUri,
  getBoxId,
  getProcessArgv,
  getPurseId,
  log,
} = require('./utils');

module.exports.swap = async () => {
  const masterRegistryUri = getMasterRegistryUri();
  const contractId = getProcessArgv('--contract-id');
  if (!contractId) {
    console.log('missing --contract-id you want to swap with')
  }
  const boxId = getBoxId();

  const purseId = getPurseId();
  if (!contractId) {
    console.log('missing --purse-id in contract you want to swap with')
  }
  const quantity = getQuantity();

  const term = swapTerm({
    masterRegistryUri: masterRegistryUri,
    purseId: purseId,
    contractId: contractId,
    boxId: boxId,
    quantity: quantity,
    merge: true,
    data: '',
    newId: getNewId() || 'auto',
  });

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
