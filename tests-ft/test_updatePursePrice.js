const rc = require('@fabcotech/rchain-toolkit');

const { updatePursePriceTerm } = require('../src');

module.exports.main = async (
  privateKey,
  publicKey,
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
      term,
      privateKey,
      1,
      1000000000,
      400000
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
