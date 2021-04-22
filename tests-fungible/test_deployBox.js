const { boxTerm } = require('../src');
const rc = require('rchain-toolkit');

const waitForUnforgeable = require('../cli/waitForUnforgeable.js').main;
const { validAfterBlockNumber, prepareDeploy } = require('../cli/utils');

module.exports.main = async (privateKey, publicKey) => {
  const term = boxTerm({ publicKey: publicKey });
  console.log(
    '  00 deploy box is ' + Buffer.from(term).length / 1000000 + 'mb'
  );
  const timestamp = new Date().getTime();
  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const pd = await prepareDeploy(
    process.env.READ_ONLY_HOST,
    publicKey,
    timestamp
  );

  const deployOptions = await rc.utils.getDeployOptions(
    'secp256k1',
    timestamp,
    term,
    privateKey,
    publicKey,
    1,
    1000000,
    vab || -1
  );

  try {
    const deployResponse = await rc.http.deploy(
      process.env.VALIDATOR_HOST,
      deployOptions
    );
    if (!deployResponse.startsWith('"Success!')) {
      console.log(deployResponse);
      throw new Error('00_deployBox 01');
    }
  } catch (err) {
    console.log(err);
    throw new Error('00_deployBox 02');
  }

  let dataAtNameResponse;
  try {
    dataAtNameResponse = await waitForUnforgeable(JSON.parse(pd).names[0]);
  } catch (err) {
    console.log(err);
    throw new Error('00_deployBox 05');
  }
  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  if (typeof data.registryUri !== 'string') {
    throw new Error('00_deployBox invalid data.registryUri');
  }

  return data;
};
