const rchainToolkit = require('rchain-toolkit');
const uuidv4 = require('uuid/v4');

const { setLockedTerm } = require('../src/');

const {
  getContractNonce,
  getRegistryUri,
  generateSignature,
  log,
  validAfterBlockNumber,
} = require('./utils');

module.exports.lock = async () => {
  log(
    'Make sure the private key provided is the one of the contract owner (initial deploy)'
  );
  const registryUri = getRegistryUri();
  const contractNonce = getContractNonce();
  const newNonce = uuidv4().replace(/-/g, '');
  const payload = {
    nonce: contractNonce,
    newNonce: newNonce,
  };

  const ba = rchainToolkit.utils.toByteArray(payload);
  const signature = generateSignature(ba, process.env.PRIVATE_KEY);
  const term = setLockedTerm(registryUri, payload, signature);

  const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(
    process.env.PRIVATE_KEY
  );
  const timestamp = new Date().getTime();
  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const deployOptions = await rchainToolkit.utils.getDeployOptions(
    'secp256k1',
    timestamp,
    term,
    process.env.PRIVATE_KEY,
    publicKey,
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
