const rc = require('@fabcotech/rchain-toolkit');

const { creditAndSwapTerm } = require('../src');

module.exports.main = async (privateKey, payloadCredit, payloadSwap) => {
  const term = creditAndSwapTerm(payloadCredit, payloadSwap);
  console.log(term);

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
    throw new Error('credit 01');
  }

  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  return data;
};
