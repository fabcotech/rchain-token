const rc = require('rchain-toolkit');

const { renewTerm } = require('../src');

module.exports.main = async (privateKey, payload) => {
  const term = renewTerm(payload);

  const dataAtNameResponse = await rc.http.easyDeploy(
    process.env.VALIDATOR_HOST,
    term,
    privateKey,
    1,
    1000000000,
    400000
  );

  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  return data;
};
