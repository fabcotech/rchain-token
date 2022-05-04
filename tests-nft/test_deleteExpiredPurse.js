const rc = require('@fabcotech/rchain-toolkit');

const { deleteExpiredPurseTerm } = require('../src/deleteExpiredPurseTerm');

module.exports.main = async (
  privateKey,
  masterRegistryUri,
  contractId,
  boxId,
  purseId
) => {

  const payload = {
    masterRegistryUri: masterRegistryUri,
    contractId: contractId,
    purseId: purseId,
    boxId: boxId,
  };

  const term = deleteExpiredPurseTerm(payload);
  const dataAtNameResponse = await rc.http.easyDeploy(
    process.env.VALIDATOR_HOST,
    {
      term,
      shardId: process.env.SHARD_ID,
      privateKey: privateKey,
      phloPrice: 'auto',
      phloLimit: 100000000,
      timeout: 400000
    }
  );

  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  return data;
};
