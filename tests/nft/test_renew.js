const rc = require('@fabcotech/rchain-toolkit');

const { renewTerm } = require('../../src');

module.exports.main = async (privateKey, payload) => {
  const term = renewTerm(payload);

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
