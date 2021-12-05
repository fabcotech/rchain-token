const rchainToolkit = require('rchain-toolkit');
const uuidv4 = require('uuid/v4');

const { updateBagDataTerm } = require('../src/');

const {
  getFile,
  getRegistryUri,
  getNonce,
  generateSignature,
  log,
  getProcessArgv,
} = require('./utils');

module.exports.updateBagData = async () => {
  const registryUri = getRegistryUri();
  const data = getFile();
  log('✓ found file ' + getProcessArgv('--file'));
  const bagId = getProcessArgv('--bag');
  if (!bagId) {
    throw new Error('Missing arguments --bag');
  }
  const newNonce = uuidv4().replace(/-/g, '');

  const payload = {
    nonce: getNonce(),
    newNonce: newNonce,
    bagId: bagId,
    data: data ? encodeURI(data) : undefined,
  };

  const ba = rchainToolkit.utils.toByteArray(payload);
  const signature = generateSignature(ba, process.env.PRIVATE_KEY);
  const term = updateBagDataTerm(registryUri, payload, signature);
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
