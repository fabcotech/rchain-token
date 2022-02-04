const { deploy } = require('./cli/deploy');
const { deployMaster } = require('./cli/deployMaster');
const { deployBox } = require('./cli/deployBox');
const { purchaseTokens } = require('./cli/purchaseTokens');
const { view } = require('./cli/view');
const { swap } = require('./cli/swap');
const { viewBox } = require('./cli/viewBox');
const { withdraw } = require('./cli/withdraw');
const { createPurse } = require('./cli/createPurse');
const { lock } = require('./cli/lock');
const { deletePurse } = require('./cli/deletePurse');
const { updateBagData } = require('./cli/updateBagData');
const { viewData } = require('./cli/viewData');
const { updatePursePrice } = require('./cli/updatePursePrice');
const { renew } = require('./cli/renew');
const { viewLogs } = require('./cli/viewLogs');

const { log } = require('./cli/utils');

require('dotenv').config();

const errorInEnv = () => {
  log(`The .env file is invalid, please make sure that it has the following values:
READ_ONLY_HOST=
VALIDATOR_HOST=
PRIVATE_KEY=
`);
};

const execDeployMaster = async () => {
  if (typeof process.env.MASTER_REGISTRY_URI === 'string') {
    console.log('Please remove MASTER_REGISTRY_URI=* line in .env file');
    process.exit();
  }

  const masterRegistryURI = await deployMaster({
    validatorHost: process.env.VALIDATOR_HOST,
    privateKey: process.env.PRIVATE_KEY,      
  });

  log('✓ deployed master and retrieved data from the blockchain');
  let envText = fs.readFileSync('./.env', 'utf8');
  envText += `\nMASTER_REGISTRY_URI=${masterRegistryURI}`;
  fs.writeFileSync('./.env', envText, 'utf8');
  log(`✓ updated .env file with MASTER_REGISTRY_URI=${masterRegistryURI}`);
}

const execDeployBox = async () => {
  if (typeof process.env.BOX_ID === 'string') {
    console.log('Please remove BOX_ID=* line in .env file');
    process.exit();
  }

  const masterRegistryUri = getMasterRegistryUri();
  const boxId = getProcessArgv('--box-id');
  if (!boxId || boxId.length === 0) {
    throw new Error('Missing arguments --box-id');
  }

  console.log(masterRegistryUri);
  const rBoxId = await deployBox({
    validatorHost: process.env.VALIDATOR_HOST,
    masterRegistryUri,
    boxId,
    privateKey: process.env.PRIVATE_KEY,
  });

  let envText = fs.readFileSync('./.env', 'utf8');
  envText += `\nBOX_ID=${rBoxId}`;
  fs.writeFileSync('./.env', envText, 'utf8');
  log('✓ deployed and retrieved data from the blockchain');
  log(`✓ updated .env file with BOX_ID=${rBoxId}`);
  log(`box id    : ${rBoxId}`);
}

const main = async () => {
  if (
    typeof process.env.READ_ONLY_HOST !== 'string' ||
    typeof process.env.VALIDATOR_HOST !== 'string' ||
    typeof process.env.PRIVATE_KEY !== 'string'
  ) {
    errorInEnv();
    return;
  }

  const viewArg = process.argv.findIndex((arg) => arg === 'view') !== -1;
  if (viewArg) {
    view();
    return;
  }

  const viewBoxArg = process.argv.findIndex((arg) => arg === 'view-box') !== -1;
  if (viewBoxArg) {
    viewBox();
    return;
  }

  const viewDataArg =
    process.argv.findIndex((arg) => arg === 'view-data') !== -1;
  if (viewDataArg) {
    viewData();
    return;
  }

  const deployArg = process.argv.findIndex((arg) => arg === 'deploy') !== -1;
  if (deployArg) {
    deploy();
    return;
  }

  const deployMasterArg =
    process.argv.findIndex((arg) => arg === 'deploy-master') !== -1;
  if (deployMasterArg) {
    await execDeployMaster();
    return;
  }

  const deployBoxArg =
    process.argv.findIndex((arg) => arg === 'deploy-box') !== -1;
  if (deployBoxArg) {
    await execDeployBox();
    return;
  }

  const SwapArg =
  process.argv.findIndex((arg) => arg === 'swap') !== -1;
if (SwapArg) {
  swap();
  return;
}

  const lockArg = process.argv.findIndex((arg) => arg === 'lock') !== -1;
  if (lockArg) {
    lock();
    return;
  }

  const deletePurseArg =
    process.argv.findIndex((arg) => arg === 'delete-purse') !== -1;
  if (deletePurseArg) {
    deletePurse();
    return;
  }

  const createPurseArg =
    process.argv.findIndex((arg) => arg === 'create-purse') !== -1;
  if (createPurseArg) {
    createPurse();
    return;
  }

  const purchaseTokensArg =
    process.argv.findIndex((arg) => arg === 'purchase-tokens') !== -1;
  if (purchaseTokensArg) {
    console.log('not implemented');
    process.exit();
    purchaseTokens();
    return;
  }

  const withdrawArg =
    process.argv.findIndex((arg) => arg === 'withdraw') !== -1;
  if (withdrawArg) {
    withdraw();
    return;
  }

  const updateBagDataArg =
    process.argv.findIndex((arg) => arg === 'update-bag-data') !== -1;
  if (updateBagDataArg) {
    console.log('not implemented');
    process.exit();
    updateBagData();
    return;
  }

  const updatePursePriceArg =
    process.argv.findIndex((arg) => arg === 'update-purse-price') !== -1;
  if (updatePursePriceArg) {
    updatePursePrice();
    return;
  }

  const renewArg = process.argv.findIndex((arg) => arg === 'renew') !== -1;
  if (renewArg) {
    renew();
    return;
  }

  const viewLogsArg =
    process.argv.findIndex((arg) => arg === 'view-logs') !== -1;
  if (viewLogsArg) {
    viewLogs();
    return;
  }

  throw new Error('unknown command');
};

main();