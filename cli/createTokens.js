const rchainToolkit = require('rchain-toolkit');
const uuidv4 = require("uuid/v4");

const {
  createTokensTerm,
} = require('../src/');

const {
  getProcessArgv,
  getContractNonce,
  getNewBagId,
  getQuantity,
  getRegistryUri,
  generateSignature,
  getTokenId,
  log,
  validAfterBlockNumber,
} = require('./utils');

module.exports.createTokens = async () => {
  log('Make sure the private key provided is the one of the contract owner (initial deploy)');
  log('Make sure the contract is not locked');
  log('Make sure you dont override any existing bag with --new-bag option');
  const registryUri = getRegistryUri();
  const contractNonce = getContractNonce();
  const tokenId = getTokenId();
  if (!tokenId) {
    throw new Error("Please provide a token ID with --token option")
  }
  const quantity = getQuantity();
  const newBagId = getNewBagId();
  const price = getProcessArgv('--price') ?
    parseInt(getProcessArgv('--price'), 10) :
    undefined;
  const newNonce = uuidv4().replace(/-/g, "");
  const bagNonce = uuidv4().replace(/-/g, "");
  const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(process.env.PRIVATE_KEY);
  const payload = {
    bags: {
      [`${newBagId}`]: {
        nonce: bagNonce,
        publicKey: publicKey,
        n: tokenId,
        price: price,
        quantity: quantity,
      }
    },
    data: {
      [`${newBagId}`]: null
    },
    nonce: contractNonce,
    newNonce: newNonce,
  }

  const ba = rchainToolkit.utils.toByteArray(payload);
  const signature = generateSignature(ba, process.env.PRIVATE_KEY);
  const term = createTokensTerm(
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