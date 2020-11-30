const rchainToolkit = require('rchain-toolkit');
const uuidv4 = require("uuid/v4");

const {
  purchaseTokensTerm,
} = require('../src/');

const {
  getFromBagId,
  getQuantity,
  getRegistryUri,
  getPrice,
  getNewBagId,
  log,
  validAfterBlockNumber,
} = require('./utils');

module.exports.purchaseTokens = async () => {
  const registryUri = getRegistryUri();
  const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(process.env.PRIVATE_KEY);
  const bagId = getFromBagId();
  const newBagId = getNewBagId();
  const quantity = getQuantity();
  const price = getPrice();
  const bagNonce = uuidv4().replace(/-/g, "");

  const term = purchaseTokensTerm(
    registryUri,
    {
      publicKey: publicKey,
      newBagId: newBagId,
      bagId: bagId,
      quantity: quantity,
      price: price,
      bagNonce: bagNonce,
      data: undefined,
    }
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