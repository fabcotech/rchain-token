const rc = require('rchain-toolkit');

const { splitPurseTerm } = require('../src');
const { validAfterBlockNumber, prepareDeploy } = require('../cli/utils');
const waitForUnforgeable = require('../cli/waitForUnforgeable').main;

module.exports.main = async (
  contractRegistryUri,
  privateKey,
  publicKey,
  fromBoxRegistryUri,
  quantityInNewPurse,
  purseId
) => {
  const timestamp = new Date().getTime();
  const pd = await prepareDeploy(
    process.env.READ_ONLY_HOST,
    publicKey,
    timestamp
  );

  const payload = {
    fromBoxRegistryUri: fromBoxRegistryUri,
    quantityInNewPurse: quantityInNewPurse,
    purseId: purseId,
  };

  const term = splitPurseTerm(contractRegistryUri, payload);

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
    throw new Error('07_updateBagData 05');
  }
  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  return;
};
