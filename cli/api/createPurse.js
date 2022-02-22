const rchainToolkit = require('rchain-toolkit');
const { createPursesTerm } = require('../../src');

module.exports.createPurse = async (args) => {
  const {
    masterRegistryUri,
    validatorHost,
    privateKey,
    contractId,
    purses,
    pursesData,
  } = args;
  const payload = {
    masterRegistryUri,
    contractId,
    purses,
    data: pursesData 
  }
  const term = createPursesTerm(payload);

  const response = await rchainToolkit.http.easyDeploy(
    validatorHost,
    term,
    privateKey,
    1,
    10000000,
    10 * 60 * 1000
  );

  const data = rchainToolkit.utils.rhoValToJs(
    JSON.parse(response).exprs[0].expr
  );

  if (data.status !== 'completed') {
    throw new Error(`Deploy status: ${data.status}, message: ${data.message}`);
  }

  return data;
};
