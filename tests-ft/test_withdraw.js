const rc = require('@fabcotech/rchain-toolkit');

const { withdrawTerm } = require('../src');

module.exports.main = async (
  privateKey,
  masterRegistryUri,
  fromBoxId,
  toBoxId,
  contractId,
  quantity,
  purseId
) => {
  const payload = {
    masterRegistryUri: masterRegistryUri,
    withdrawQuantity: quantity,
    purseId: purseId,
    toBoxId: toBoxId,
    boxId: fromBoxId,
    contractId: contractId,
    merge: true
  }
  const term = withdrawTerm(payload);

  let dataAtNameResponse = await rc.http.easyDeploy(
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
