const { deploy } = require('./cli/deploy');
const { deployMaster } = require('./cli/deployMaster');
const { deployBox } = require('./cli/deployBox');
const { purchaseTokens } = require('./cli/purchaseTokens');
const { view } = require('./cli/view');
const { viewBox } = require('./cli/viewBox');
const { sendPurse } = require('./cli/sendPurse');
const { createPurse } = require('./cli/createPurse');
const { lock } = require('./cli/lock');
const { updateBagData } = require('./cli/updateBagData');
const { updateTokenData } = require('./cli/updateTokenData');
const { viewData } = require('./cli/viewData');
const { changePrice } = require('./cli/changePrice');

const { log } = require('./cli/utils');

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
    deploy();
    return;
  }

  const deployMasterArg = process.argv.findIndex((arg) => arg === 'deploy-master') !== -1;
  if (deployMasterArg) {
    deployMaster();
    return;
  }

  const deployBoxArg =
    process.argv.findIndex((arg) => arg === 'deploy-box') !== -1;
  if (deployBoxArg) {
    deployBox();
    return;
  }

  const lockArg = process.argv.findIndex((arg) => arg === 'lock') !== -1;
  if (lockArg) {
    console.log('not implemented');
    process.exit();
    lock();
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

  const sendPurseArg =
    process.argv.findIndex((arg) => arg === 'send-purse') !== -1;
  if (sendPurseArg) {
    sendPurse();
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

  const updateTokenDataArg =
    process.argv.findIndex((arg) => arg === 'update-token-data') !== -1;
  if (updateTokenDataArg) {
    console.log('not implemented');
    process.exit();
    updateTokenData();
    return;
  }

  const changePriceArg =
    process.argv.findIndex((arg) => arg === 'change-price') !== -1;
  if (changePriceArg) {
    console.log('not implemented');
    process.exit();
    changePrice();
    return;
  }

  throw new Error('unknown command');
};

main();
