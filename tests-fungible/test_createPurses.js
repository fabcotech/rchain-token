const rc = require('rchain-toolkit');
const uuidv4 = require('uuid/v4');

const { createPursesTerm } = require('../src/createPursesTerm');
const { validAfterBlockNumber, prepareDeploy } = require('../cli/utils');
const waitForUnforgeable = require('./waitForUnforgeable').main;

module.exports.main = async (
  contractRegistryUri,
  privateKey1,
  publicKey1,
  boxRegistryUri,
  bagsToCreate
) => {
  const timestamp = new Date().getTime();
  const pd = await prepareDeploy(
    process.env.READ_ONLY_HOST,
    publicKey1,
    timestamp
  );

  const payload = {
    purses: {},
    data: {},
    fromBoxRegistryUri: boxRegistryUri,
  };
  for (let i = 0; i < bagsToCreate; i += 1) {
    payload.purses[i] = {
      id: '', // will be ignored, contract is fugible contract
      publicKey: publicKey1,
      box: `$BQrho:id:${boxRegistryUri}$BQ`,
      type: '0',
      quantity: 3,
      price: null,
    };
  }

  const term = createPursesTerm(contractRegistryUri, payload);
  console.log('  03 deploy is ' + Buffer.from(term).length / 1000000 + 'mb');
  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const deployOptions = await rc.utils.getDeployOptions(
    'secp256k1',
    timestamp,
    term,
    privateKey1,
    publicKey1,
    1,
    1000000000,
    vab
  );

  try {
    const deployResponse = await rc.http.deploy(
      process.env.VALIDATOR_HOST,
      deployOptions
    );
    if (!deployResponse.startsWith('"Success!')) {
      console.log(deployResponse);
      throw new Error('03_createTokens 01');
    }
  } catch (err) {
    console.log(err);
    throw new Error('03_createTokens 02');
  }

  let dataAtNameResponse;
  try {
    dataAtNameResponse = await waitForUnforgeable(JSON.parse(pd).names[0]);
  } catch (err) {
    console.log(err);
    throw new Error('03_createTokens 05');
  }
  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  return;
};
