const rc = require('@fabcotech/rchain-toolkit');

const { deletePurseTerm } = require('../src/deletePurseTerm');

module.exports.main = async (
  privateKey,
  masterRegistryUri,
  contractId,
  boxId,
  purseId
) => {
  const payload = {
    purseId: purseId,
    masterRegistryUri: masterRegistryUri,
    contractId: contractId,
    boxId: boxId,
  };

  const term = deletePurseTerm(payload);
  let dataAtNameResponse;
  try {
    dataAtNameResponse = await rc.http.easyDeploy(
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
  } catch (err) {
    console.log(err);
    throw new Error('03_createTokens 02');
  }

  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  return data;
};
