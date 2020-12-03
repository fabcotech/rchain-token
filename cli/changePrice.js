const rchainToolkit = require('rchain-toolkit');
const uuidv4 = require("uuid/v4");

const {
  changePriceTerm,
} = require('../src/');

const {
  getRegistryUri,
  getNonce,
  generateSignature,
  log,
  validAfterBlockNumber,
  getProcessArgv,
} = require('./utils');

module.exports.changePrice = async () => {
  const registryUri = getRegistryUri();
  const bagId = getProcessArgv('--bag');
  if(!bagId) {
    throw new Error('Missing arguments --bag');
  }
  const price = getProcessArgv('--price') ?
    parseInt(getProcessArgv('--price'), 10) :
    undefined;
  
  const payload = {
    nonce: getNonce(),
    bagNonce: uuidv4().replace(/-/g, ""),
    bagId: bagId,
    price: price,
  };
    
  const ba = rchainToolkit.utils.objectToByteArray(payload);
  const signature = generateSignature(ba, process.env.PRIVATE_KEY);
  const term = changePriceTerm(
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