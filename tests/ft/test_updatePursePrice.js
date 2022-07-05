const rc = require('@fabcotech/rchain-toolkit');

const { updatePursePriceTerm } = require('../../src');

module.exports.main = async (
  privateKey,
  masterRegistryUri,
  boxId,
  contractId,
  purseId,
  price
) => {
  const payload = {
    masterRegistryUri: masterRegistryUri,
    purseId: purseId,
    boxId: boxId,
    contractId: contractId,
    price: price,
  };

  const term = updatePursePriceTerm(payload);

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
    throw new Error('test_updatePursePrice 01');
  }

  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  return data;
};
