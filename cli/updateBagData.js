const rchainToolkit = require('rchain-toolkit');
const uuidv4 = require("uuid/v4");

const {
  updateBagDataTerm,
} = require('../src/');

const {
  getFile,
  getRegistryUri,
  getNonce,
  generateSignature,
  log,
  getProcessArgv,
  validAfterBlockNumber,
} = require('./utils');

module.exports.updateBagData = async () => {
  const registryUri = getRegistryUri();
  const data = getFile();
  log('✓ found file ' + getProcessArgv('--file'));
  const bagId = getProcessArgv('--bag');
  if(!bagId) {
    throw new Error('Missing arguments --bag');
  }
  const newNonce = uuidv4().replace(/-/g, "");

  const payload = {
    nonce: getNonce(),
    newNonce: newNonce,
    bagId: bagId,
    data: data ? encodeURI(data) : undefined
  };

  const ba = rchainToolkit.utils.toByteArray(payload);
  const signature = generateSignature(ba, process.env.PRIVATE_KEY);
  const term = updateBagDataTerm(
    registryUri,
    payload,
    signature,
  );
  const timestamp = new Date().getTime();
  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const deployOptions = await rchainToolkit.utils.getDeployOptions(
    "secp256k1",
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
      log("Unable to deploy");
      console.log(deployResponse);
      process.exit();
    }
  } catch (err) {
    log("Unable to deploy");
    console.log(err);
    process.exit();
  }
  log('✓ deployed');
}