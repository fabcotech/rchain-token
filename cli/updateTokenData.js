const rchainToolkit = require('rchain-toolkit');
const uuidv4 = require("uuid/v4");

const {
  updateTokenDataTerm,
} = require('../src/');

const {
  getFile,
  getRegistryUri,
  generateSignature,
  log,
  getProcessArgv,
  validAfterBlockNumber,
  getContractNonce,
  getTokenId,
} = require('./utils');

module.exports.updateTokenData = async () => {
  log('Make sure the private key provided is the one of the contract owner (initial deploy)');
  log('Make sure the contract is not locked');
  const registryUri = getRegistryUri();
  const data = getFile();
  log('✓ found file ' + getProcessArgv('--file'));
  const tokenId = getTokenId();
  const newNonce = uuidv4().replace(/-/g, "");
  const signature = generateSignature(getContractNonce(), process.env.PRIVATE_KEY);
  const term = updateTokenDataTerm(
    registryUri,
    newNonce,
    signature,
    tokenId,
    data
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