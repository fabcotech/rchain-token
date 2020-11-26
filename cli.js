const { deploy } = require('./cli/deploy');
const { purchaseTokens } = require('./cli/purchaseTokens');
const { view } = require('./cli/view');
const { sendTokens } = require('./cli/sendTokens');
const { createTokens } = require('./cli/createTokens');
const { lock } = require('./cli/lock');
const { updateBagData } = require('./cli/updateBagData');
const { updateTokenData } = require('./cli/updateTokenData');

const {
  log,
} = require('./cli/utils');


require("dotenv").config();

const errorInEnv = () => {
  log(`The .env file is invalid, please make sure that it has the following values:
READ_ONLY_HOST=
VALIDATOR_HOST=
PRIVATE_KEY=
`);
}

const main = async () => {
  if (
    typeof process.env.READ_ONLY_HOST !== "string" ||
    typeof process.env.VALIDATOR_HOST !== "string" ||
    typeof process.env.PRIVATE_KEY !== "string"
  ) {
    errorInEnv();
    return;
  }

  const viewArg = process.argv.findIndex((arg) => arg === 'view') !== -1;
  if (viewArg) {
    view();
    return;
  }

  const deployArg = process.argv.findIndex((arg) => arg === 'deploy') !== -1;
  if (deployArg) {
    deploy();
    return;
  }

  const lockArg = process.argv.findIndex((arg) => arg === 'lock') !== -1;
  if (lockArg) {
    lock();
    return;
  }

  const createTokensArg = process.argv.findIndex((arg) => arg === 'create-tokens') !== -1;
  if (createTokensArg) {
    createTokens();
    return;
  }

  const purchaseTokensArg = process.argv.findIndex((arg) => arg === 'purchase-tokens') !== -1;
  if (purchaseTokensArg) {
    purchaseTokens();
    return;
  }

  const sendTokensArg = process.argv.findIndex((arg) => arg === 'send-tokens') !== -1;
  if (sendTokensArg) {
    sendTokens();
    return;
  }

  const updateBagDataArg = process.argv.findIndex((arg) => arg === 'update-bag-data') !== -1;
  if (updateBagDataArg) {
    updateBagData();
    return;
  }

  const updateTokenDataArg = process.argv.findIndex((arg) => arg === 'update-token-data') !== -1;
  if (updateTokenDataArg) {
    updateTokenData();
    return;
  }

  console.log('unknown command');
};

main();