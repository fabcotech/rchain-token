const rchainToolkit = require('@fabcotech/rchain-toolkit');

const { withdrawTerm } = require('../src');

const {
  getQuantity,
  getPurseId,
  getToBoxId,
  getBoxId,
  getMerge,
  log,
  getMasterRegistryUri,
  getContractId,
} = require('./utils');

module.exports.withdraw = async () => {
  const boxId = getBoxId();
  const masterRegistryUri = getMasterRegistryUri();
  const contractId = getContractId();
  const toBoxId = getToBoxId();
  const purseId = getPurseId();

  if (!purseId) {
    throw new Error('please provide --purse option');
  }

  const payload = {
    masterRegistryUri: masterRegistryUri,
    withdrawQuantity: getQuantity(),
    purseId: purseId,
    toBoxId: toBoxId,
    boxId: boxId,
    contractId: contractId,
    merge: getMerge(),
  };
  const term = withdrawTerm(payload);

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
