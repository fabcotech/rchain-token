const rchainToolkit = require('rchain-toolkit');

const { sendPurseTerm } = require('../src/');

const {
  getBoxRegistryUri,
  getRegistryUri,
  getPurseId,
  getToBoxId,
  log,
  validAfterBlockNumber,
} = require('./utils');

module.exports.sendPurse = async () => {
  const registryUri = getRegistryUri();
  const to = getToBoxId();
  const boxRegistryUri = getBoxRegistryUri();
  const timestamp = new Date().getTime();
  const purseId = getPurseId();
  if (!purseId) {
    throw new Error('please provide --purse option');
  }
  const payload = {
    fromBoxRegistryUri: boxRegistryUri,
    toBoxRegistryUri: to,
    purseId: purseId,
  };
  const term = sendPurseTerm(registryUri, payload);

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
