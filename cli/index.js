const { execDeploy } = require('./deploy');
const { execDeployMaster } = require('./deployMaster');
const { execDeployBox } = require('./deployBox');
const { execCreatePurse } = require('./createPurse');
const { execUpdatePursePrice } = require('./updatePursePrice');
const { purchaseTokens } = require('./purchaseTokens');
const { view } = require('./view');
const { swap } = require('./swap');
const { viewBox } = require('./viewBox');
const { withdraw } = require('./withdraw');
const { lock } = require('./lock');
const { deletePurse } = require('./deletePurse');
const { updateBagData } = require('./updateBagData');
const { viewData } = require('./viewData');
const { renew } = require('./renew');
const { viewLogs } = require('./viewLogs');

const { log } = require('./utils');

require('dotenv').config();

const errorInEnv = () => {
  log(`The .env file is invalid, please make sure that it has the following values:
READ_ONLY_HOST=
VALIDATOR_HOST=
PRIVATE_KEY=
`);
};

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
    await execDeploy();
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

  const creditArg =
    process.argv.findIndex((arg) => arg === 'credit') !== -1;
  if (creditArg) {
    credit();
    return;
  }

  const createPurseArg =
    process.argv.findIndex((arg) => arg === 'create-purse') !== -1;
  if (createPurseArg) {
    await execCreatePurse();
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
    execUpdatePursePrice();
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
