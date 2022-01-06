const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');

const { deployBoxTerm } = require('../src/');

const { log, getMasterRegistryUri, getProcessArgv } = require('./utils');

module.exports.deployBox = async () => {
  if (typeof process.env.BOX_ID === 'string') {
    console.log('Please remove BOX_ID=* line in .env file');
    process.exit();
  }

  const masterRegistryUri = getMasterRegistryUri();
  const boxId = getProcessArgv('--box-id');
  if (!boxId || boxId.length === 0) {
    throw new Error('Missing arguments --box-id');
  }

  const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(
    process.env.PRIVATE_KEY
  );

  const term = deployBoxTerm({ masterRegistryUri: masterRegistryUri, boxId: boxId, publicKey: publicKey, revAddress: rchainToolkit.utils.revAddressFromPublicKey(publicKey) });
  let dataAtNameResponse;
  try {
    dataAtNameResponse = await rchainToolkit.http.easyDeploy(
      process.env.VALIDATOR_HOST,
      term,
      process.env.PRIVATE_KEY,
      1,
      10000000,
      3 * 60 * 1000
    );
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }

  const data = rchainToolkit.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );
  if (data.status !== "completed") {
    console.log(data);
    process.exit();
  }
  let envText = fs.readFileSync('./.env', 'utf8');
  envText += `\nBOX_ID=${data.boxId}`;
  fs.writeFileSync('./.env', envText, 'utf8');
  log('✓ deployed and retrieved data from the blockchain');
  log(`✓ updated .env file with BOX_ID=${data.boxId}`);
  log(`box id    : ${data.boxId}`);
};
