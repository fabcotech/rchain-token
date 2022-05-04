const rc = require('@fabcotech/rchain-toolkit');

const { createPursesTerm } = require('../src/createPursesTerm');
const { validAfterBlockNumber, prepareDeploy } = require('../cli/utils');
const waitForUnforgeable = require('../cli/waitForUnforgeable').main;

module.exports.main = async (
  privateKey1,
  publicKey1,
  masterRegistryUri,
  contractId,
  boxId,
  toBoxId,
  ids
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
    masterRegistryUri: masterRegistryUri,
    contractId: contractId,
    boxId: boxId,
  };
  for (let i = 0; i < ids.length; i += 1) {
    payload.purses[ids[i]] = {
      id: ids[i], // will be checked and use as id if available (non-fungible)
      boxId: toBoxId,
      quantity: 1,
      price: null,
    };
  }

  const term = createPursesTerm(payload);
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

  return data;
};
