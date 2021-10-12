const rchainToolkit = require('rchain-toolkit');

const { deletePurseTerm } = require('../src/');

const {
  log,
  getMasterRegistryUri,
  getContractId,
  getPurseId,
} = require('./utils');

module.exports.deletePurse = async () => {
  const masterRegistryUri = getMasterRegistryUri();
  const contractId = getContractId();
  const purseId = getPurseId();
  log('Make sure the private key provided is the one of the contract');
  log('Make sure the contract is not locked');

  let payload = {
    masterRegistryUri: masterRegistryUri,
    contractId: contractId,
    purseId: purseId,
  };

  const term = deletePurseTerm(payload);

  const deployResponse = await rchainToolkit.http.easyDeploy(
    process.env.READ_ONLY_HOST,
    term,
    process.env.PRIVATE_KEY,
    1,
    100000000
  );
  if (!deployResponse.startsWith('"Success!')) {
    log('Unable to deploy');
    console.log(deployResponse);
    process.exit();
  }
  log('✓ deployed');
};
