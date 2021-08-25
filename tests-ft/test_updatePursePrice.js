const rc = require('rchain-toolkit');

const { updatePursePriceTerm } = require('../src');
const { validAfterBlockNumber, prepareDeploy } = require('../cli/utils');
const waitForUnforgeable = require('../cli/waitForUnforgeable').main;

module.exports.main = async (
  privateKey,
  publicKey,
  masterRegistryUri,
  boxId,
  contractId,
  purseId,
  price
) => {
  const timestamp = new Date().getTime();
  const pd = await prepareDeploy(
    process.env.READ_ONLY_HOST,
    publicKey,
    timestamp
  );

  const payload = {
    masterRegistryUri: masterRegistryUri,
    purseId: purseId,
    boxId: boxId,
    contractId: contractId,
    price: price,
  };

  const term = updatePursePriceTerm(payload);

  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const deployOptions = await rc.utils.getDeployOptions(
    'secp256k1',
    timestamp,
    term,
    privateKey,
    publicKey,
    1,
    10000000,
    vab
  );
  try {
    const deployResponse = await rc.http.deploy(
      process.env.VALIDATOR_HOST,
      deployOptions
    );
    if (!deployResponse.startsWith('"Success!')) {
      console.log(deployResponse);
      throw new Error('test_updatePursePrice 01');
    }
  } catch (err) {
    console.log(err);
    throw new Error('test_updatePursePrice 02');
  }

  let dataAtNameResponse;
  try {
    dataAtNameResponse = await waitForUnforgeable(JSON.parse(pd).names[0]);
  } catch (err) {
    console.log(err);
    throw new Error('test_updatePurseData 05');
  }

  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  if (data.status !== 'completed') {
    console.log(data);
    throw new Error('test_updatePurseData');
  }

  return data;
};
