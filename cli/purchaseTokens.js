const rchainToolkit = require('@fabcotech/rchain-toolkit');
const uuidv4 = require('uuid/v4');

const { purchaseTokensTerm } = require('../src/');

const {
  getFromBagId,
  getQuantity,
  getRegistryUri,
  getPrice,
  log,
} = require('./utils');

module.exports.purchaseTokens = async () => {
  const registryUri = getRegistryUri();
  const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(
    process.env.PRIVATE_KEY
  );
  const bagId = getFromBagId();
  const quantity = getQuantity();
  const price = getPrice();
  const bagNonce = uuidv4().replace(/-/g, '');

  const term = purchaseTokensTerm(registryUri, {
    publicKey: publicKey,
    bagId: bagId,
    quantity: quantity,
    price: price,
    bagNonce: bagNonce,
    data: undefined,
  });

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
