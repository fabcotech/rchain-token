const rchainToolkit = require('rchain-toolkit');

const { lockTerm } = require('../src/');

const {
  log,
  getMasterRegistryUri,
  getContractId,
  validAfterBlockNumber,
} = require('./utils');

module.exports.lock = async () => {
  const masterRegistryUri = getMasterRegistryUri();
  const contractId = getContractId();
  log(
    'Make sure the private key provided is the one of the contract'
  );
  log('Make sure the contract is not locked');

  const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(
    process.env.PRIVATE_KEY
  );

  let payload = {
    masterRegistryUri: masterRegistryUri,
    contractId: contractId,
  };

  const term = lockTerm(payload);

  const timestamp = new Date().getTime();
  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const deployOptions = await rchainToolkit.utils.getDeployOptions(
    'secp256k1',
    timestamp,
    term,
    process.env.PRIVATE_KEY,
    publicKey,
    1,
    100000000,
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
