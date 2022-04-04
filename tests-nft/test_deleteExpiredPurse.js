const rc = require('rchain-toolkit');

const { deleteExpiredPurseTerm } = require('../src/deleteExpiredPurseTerm');

module.exports.main = async (
  privateKey1,
  publicKey1,
  masterRegistryUri,
  contractId,
  boxId,
  purseId
) => {

  const payload = {
    masterRegistryUri: masterRegistryUri,
    contractId: contractId,
    purseId: purseId,
    boxId: boxId,
  };

  const term = deleteExpiredPurseTerm(payload);
  const dataAtNameResponse = await rc.http.easyDeploy(
    process.env.VALIDATOR_HOST,
    term,
    privateKey1,
    1,
    1000000000,
    400000
  );

  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  return data;
};
