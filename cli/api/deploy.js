const rchainToolkit = require('@fabcotech/rchain-toolkit');

const { deployTerm } = require('../../src/');

module.exports.deploy = async ({
  masterRegistryUri,
  validatorHost,
  shardId,
  privateKey,
  boxId,
  fungible,
  contractId,
  expires,
}) => {
  const term = deployTerm({
    masterRegistryUri,
    boxId,
    fungible,
    contractId,
    expires
  });

  const dataAtNameResponse = await rchainToolkit.http.easyDeploy(
    validatorHost,
    {
      term,
      shardId: shardId,
      privateKey: privateKey,
      phloPrice: 'auto',
      phloLimit: 10000000,
      timeout: 10 * 60 * 1000
    }
  );

  const data = rchainToolkit.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  if (data.status !== 'completed') {
    throw new Error(`Deploy status: ${data.status}, message: ${data.message}`);
  }

  return data.contractId;
};
