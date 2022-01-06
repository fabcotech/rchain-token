const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');

const { VERSION } = require('../constants');
const { deployTerm } = require('../src/');
const {
  log,
  getMasterRegistryUri,
  getFungible,
  getContractId,
  getExpires,
  logData,
  getBoxId,
} = require('./utils');

module.exports.deploy = async () => {
  if (typeof process.env.CONTRACT_ID === 'string') {
    console.log('Please remove CONTRACT_ID=* line in .env file');
    process.exit();
  }
  const masterRegistryUri = getMasterRegistryUri();
  const fungible = getFungible();
  let contractId = getContractId();
  const expires = getExpires();
  const boxId = getBoxId();

  console.log(
    `Will deploy a\x1b[36m`,
    fungible ? 'fungible' : 'non-fungible',
    '\x1b[0mtokens contract'
  );

  const term = deployTerm({
    masterRegistryUri: masterRegistryUri,
    boxId: boxId,
    fungible: fungible,
    contractId: contractId,
    expires: expires,
  });


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
  log('✓ deploy');

  const data = rchainToolkit.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );
  if (data.status !== 'completed') {
    console.log(data);
    process.exit();
  }
  contractId = data.contractId;

  let envText = fs.readFileSync('./.env', 'utf8');
  envText += `\nCONTRACT_ID=${contractId}`;
  fs.writeFileSync('./.env', envText, 'utf8');
  log('✓ deployed and retrieved data from the blockchain');
  log(`✓ updated .env file with CONTRACT_ID=${contractId}`);
  logData({
    masterRegistryUri,
    contractId,
    fungible,
    locked: false,
    version: VERSION,
  });
};
