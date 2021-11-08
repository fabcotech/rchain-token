const rc = require('rchain-toolkit');

const { purchaseTerm } = require('../src');
const waitForUnforgeable = require('../cli/waitForUnforgeable').main;
const { validAfterBlockNumber, prepareDeploy } = require('../cli/utils');

module.exports.main = async (privateKey, publicKey, payload) => {
  const timestamp = new Date().getTime() - Math.round(Math.random() * 10000);
  const pd = await prepareDeploy(
    process.env.READ_ONLY_HOST,
    publicKey,
    timestamp
  );

  const term = purchaseTerm(payload);

  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const deployOptions = await rc.utils.getDeployOptions(
    'secp256k1',
    timestamp,
    term,
    privateKey,
    publicKey,
    1,
    200000000,
    vab
  );
  try {
    const deployResponse = await rc.http.deploy(
      process.env.VALIDATOR_HOST,
      deployOptions
    );
    console.log(deployResponse);
    if (!deployResponse.startsWith('"Success!')) {
      console.log(deployResponse);
      throw new Error('07_updateBagData 01');
    }
  } catch (err) {
    console.log(err);
    throw new Error('07_updateBagData 02');
  }

  let dataAtNameResponse;
  try {
    dataAtNameResponse = await waitForUnforgeable(JSON.parse(pd).names[0]);
  } catch (err) {
    console.log(err);
    throw new Error('test_purchase 05');
  }
  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );
  console.log(data);

  return data;
};
