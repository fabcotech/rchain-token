const { masterTerm } = require('../../src');
const rc = require('@fabcotech/rchain-toolkit');

module.exports.main = async (privateKey) => {
  const term = masterTerm({
    depth: 3,
    contractDepth: 2,
  }).replace('1000 * 60 * 60 * 2', '1');

  console.log('  deployMaster is ' + Buffer.from(term).length / 1000000 + 'mb');

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
    throw new Error('deployMaster 01');
  }

  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  if (data.status !== 'completed') {
    console.log(data);
    throw new Error('deployMaster 02');
  }

  return data;
};
