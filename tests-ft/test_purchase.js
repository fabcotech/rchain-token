const rc = require('@fabcotech/rchain-toolkit');

const { purchaseTerm } = require('../src');

module.exports.main = async (privateKey, publicKey, payload) => {
  const term = purchaseTerm(payload);

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
    throw new Error('purchase 01');
  }

  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  return data;
};
