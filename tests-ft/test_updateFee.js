const { updateFeeTerm } = require('../src');
const rc = require('@fabcotech/rchain-toolkit');

module.exports.main = async (
  privateKey1,
  publicKey1,
  masterRegistryUri,
  boxId,
  contractId,
  fee,
) => {
  const term = updateFeeTerm({
    masterRegistryUri: masterRegistryUri,
    boxId: boxId,
    contractId: contractId,
    fee: fee ? fee : null,
  });

  let dataAtNameResponse;
  try {
    dataAtNameResponse = await rc.http.easyDeploy(
      process.env.VALIDATOR_HOST,
      term,
      privateKey1,
      1,
      1000000,
      1000 * 60
    );
  } catch (err) {
    console.log(err);
    throw new Error('test_updateFee 01');
  }

  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  if (data.status !== 'completed') {
    console.log(data);
    throw new Error('test_updateFee 02');
  }

  return data;
};
