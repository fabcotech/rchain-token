const rc = require('@fabcotech/rchain-toolkit');

const { updatePurseDataTerm } = require('../../src');

module.exports.main = async (
  privateKey,
  masterRegistryUri,
  boxId,
  contractId,
  purseId,
  d
) => {
  const payload = {
    masterRegistryUri: masterRegistryUri,
    purseId: purseId,
    boxId: boxId,
    contractId: contractId,
    data: d,
  };

  const term = updatePurseDataTerm(payload);

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
    throw new Error('test_updatePurseData 01');
  }

  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  if (data.status !== "completed") {
    console.log(data);
    throw new Error('test_updatePurseData 02')
  }

  return data;
};
