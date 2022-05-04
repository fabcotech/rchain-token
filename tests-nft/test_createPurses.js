const rc = require('@fabcotech/rchain-toolkit');

const { createPursesTerm } = require('../src/createPursesTerm');

module.exports.main = async (
  privateKey,
  masterRegistryUri,
  contractId,
  boxId,
  toBoxId,
  ids
) => {
  const payload = {
    purses: {
      ['0']: {
        id: '0',
        boxId: toBoxId,
        quantity: 1000000,
        price: null,
      },
    },
    data: {},
    masterRegistryUri: masterRegistryUri,
    contractId: contractId,
    boxId: boxId,
  };
  for (let i = 0; i < ids.length; i += 1) {
    payload.purses[ids[i]] = {
      id: ids[i], // will be checked and use as id if available (non-fungible)
      boxId: toBoxId,
      quantity: 1,
      price: null,
    };
  }

  const term = createPursesTerm(payload);
  console.log('  03 deploy is ' + Buffer.from(term).length / 1000000 + 'mb');
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
