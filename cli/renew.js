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

  const timestamp = new Date().getTime();
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
