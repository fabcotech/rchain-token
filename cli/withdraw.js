const rchainToolkit = require('rchain-toolkit');

const { withdrawTerm } = require('../src');

const {
  getQuantity,
  getPurseId,
  getToBoxId,
  getBoxId,
  getMerge,
  log,
  validAfterBlockNumber,
  getMasterRegistryUri,
  getContractId,
} = require('./utils');

module.exports.withdraw = async () => {
  const boxId = getBoxId();
  const masterRegistryUri = getMasterRegistryUri();
  const contractId = getContractId();
  const toBoxId = getToBoxId();
  const purseId = getPurseId();

  const timestamp = new Date().getTime();
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
