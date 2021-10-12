const rc = require('rchain-toolkit');

const { deletePurseTerm } = require('../src/deletePurseTerm');

module.exports.main = async (
  privateKey1,
  publicKey1,
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
      term,
      privateKey1,
      1,
      1000000000,
      300000
    );
  } catch (err) {
    console.log(err);
    throw new Error('03_createTokens 02');
  }
  console.log(dataAtNameResponse);

  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );
  console.log(data);

  return data;
};
