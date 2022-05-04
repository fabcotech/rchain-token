const rchainToolkit = require('@fabcotech/rchain-toolkit');

const { lockTerm } = require('../src/');

const {
  log,
  getMasterRegistryUri,
  getContractId,
} = require('./utils');

module.exports.lock = async () => {
  const masterRegistryUri = getMasterRegistryUri();
  const contractId = getContractId();
  log(
    'Make sure the private key provided is the one of the contract'
  );
  log('Make sure the contract is not locked');

  let payload = {
    masterRegistryUri: masterRegistryUri,
    contractId: contractId,
  };

  const term = lockTerm(payload);
  let deployResponse;
  try {
    deployResponse = await rchainToolkit.http.easyDeploy(
      process.env.VALIDATOR_HOST,
      {
        term,
        shardId: process.env.SHARD_ID,
        privateKey: process.env.PRIVATE_KEY,
        phloPrice: 'auto',
        phloLimit: 10000000,
      }
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
