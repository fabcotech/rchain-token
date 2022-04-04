const rc = require('@fabcotech/rchain-toolkit');

const { creditTerm } = require('../src');

module.exports.main = async (privateKey, payload) => {
  const term = creditTerm(payload);

  let dataAtNameResponse;
  try {
    dataAtNameResponse = await rc.http.easyDeploy(
      process.env.VALIDATOR_HOST,
      term,
      privateKey,
      1,
      100000000,
      400000
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
