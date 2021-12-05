const rchainToolkit = require('rchain-toolkit');

const { renewTerm, readPursesTerm } = require('../src');

const {
  getPurseId,
  getBoxId,
  log,
  validAfterBlockNumber,
  getMasterRegistryUri,
  getContractId,
} = require('./utils');

module.exports.renew = async () => {
  const masterRegistryUri = getMasterRegistryUri();
  const contractId = getContractId();
  const boxId = getBoxId();
  const purseId = getPurseId();
  const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(
    process.env.PRIVATE_KEY
  );

  if (!purseId) {
    throw new Error('please provide --purse option');
  }

  term0 = readPursesTerm({
    masterRegistryUri: masterRegistryUri,
    contractId: contractId,
    pursesIds: ['0'],
  });
  const result1 = await rchainToolkit.http.exploreDeploy(
    process.env.READ_ONLY_HOST,
    {
      term: term0,
    }
  );
  const purses = rchainToolkit.utils.rhoValToJs(JSON.parse(result1).expr[0]);
  if (!purses['0']) {
    throw new Error('Purse 0 not found, cannot renew');
  }
  let price = 1;
  if (purses['0'].price) {
    price = purses['0'].price;
  }

  const payload = {
    masterRegistryUri: masterRegistryUri,
    contractId: contractId,
    purseId: purseId,
    boxId: boxId,
    price: price,
    publicKey: publicKey,
  };
  const term = renewTerm(payload);
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
