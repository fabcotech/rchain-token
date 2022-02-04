const fs = require('fs');
const { deploy } = require('./api');

const { VERSION } = require('../constants');
const {
  log,
  getMasterRegistryUri,
  getFungible,
  getContractId,
  getExpires,
  logData,
  getBoxId,
} = require('./utils');

const execDeploy = async () => {
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

  const rContractId = await deploy({
    validatorHost: process.env.VALIDATOR_HOST,
    privateKey: process.env.PRIVATE_KEY,
    masterRegistryUri,
    boxId,
    contractId,
    fungible,
    expires,
  });

  let envText = fs.readFileSync('./.env', 'utf8');
  envText += `\nCONTRACT_ID=${rContractId}`;
  fs.writeFileSync('./.env', envText, 'utf8');
  log('✓ deployed and retrieved data from the blockchain');
  log(`✓ updated .env file with CONTRACT_ID=${rContractId}`);
  logData({
    masterRegistryUri,
    rContractId,
    fungible,
    locked: false,
    version: VERSION,
  });
};

module.exports = {
  execDeploy,
};
