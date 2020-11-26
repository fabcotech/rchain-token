const rchainToolkit = require('rchain-toolkit');
const uuidv4 = require("uuid/v4");

const {
  createTokensTerm,
} = require('../src/');

const {
  getProcessArgv,
  getContractNonce,
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
  const registryUri = getRegistryUri();
  const contractNonce = getContractNonce();
  const tokenId = getTokenId();
  const quantity = getQuantity();
  const price = getProcessArgv('--price') ?
    parseInt(getProcessArgv('--price'), 10) :
    undefined;
  const newNonce = uuidv4().replace(/-/g, "");
  const bagNonce = uuidv4().replace(/-/g, "");
  const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(process.env.PRIVATE_KEY);
  const signature = generateSignature(contractNonce, process.env.PRIVATE_KEY);
  const term = createTokensTerm(
    registryUri,
    signature,
    newNonce,
    bagNonce,
    publicKey,
    tokenId || undefined,
    price,
    quantity,
    ""
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