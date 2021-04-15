const rc = require('rchain-toolkit');

const { createPursesTerm } = require('../src/createPursesTerm');
const waitForUnforgeable = require('../tests-fungible/waitForUnforgeable').main;
const { validAfterBlockNumber, prepareDeploy } = require('../cli/utils');

module.exports.main = async (
  contractRegistryUri,
  privateKey1,
  publicKey1,
  boxRegistryUri,
  receiverBoxRegistryUri
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
  payload.purses['0'] = {
    id: '0', // will be checked and use as id if available (non-fungible)
    publicKey: publicKey1,
    box: `$BQrho:id:${boxRegistryUri}$BQ`,
    type: '0',
    quantity: 10000000000000,
    price: 1,
  };

  let term = createPursesTerm(contractRegistryUri, payload);
  var t = 0;
  term = term.replace(new RegExp(boxRegistryUri, 'g'), receiverBoxRegistryUri);
  term = term.replace(new RegExp(receiverBoxRegistryUri), boxRegistryUri);

  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const deployOptions = await rc.utils.getDeployOptions(
    'secp256k1',
    timestamp,
    term,
    privateKey1,
    publicKey1,
    1,
    100000000,
    vab
  );

  try {
    const deployResponse = await rc.http.deploy(
      process.env.VALIDATOR_HOST,
      deployOptions
    );
    if (!deployResponse.startsWith('"Success!')) {
      console.log(deployResponse);
      throw new Error('test_createPurses 01');
    }
  } catch (err) {
    console.log(err);
    throw new Error('test_createPurses 02');
  }

  let dataAtNameResponse;
  try {
    dataAtNameResponse = await waitForUnforgeable(JSON.parse(pd).names[0]);
  } catch (err) {
    console.log(err);
    throw new Error('test_createPurses 05');
  }
  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  return;
};
