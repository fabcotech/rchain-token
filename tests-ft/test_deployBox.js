const { deployBoxTerm } = require('../src');
const rc = require('rchain-toolkit');

module.exports.main = async (
  privateKey,
  publicKey,
  masterRegistryUri,
  boxId
) => {
  const term = deployBoxTerm({
    publicKey: publicKey,
    boxId: boxId,
    masterRegistryUri: masterRegistryUri,
  });
  console.log(
    '  deploy box is ' + Buffer.from(term).length / 1000000 + 'mb'
  );

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
    throw new Error('deployBox 01');
  }

  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  if (data.status !== 'completed') {
    console.log(data);
    throw new Error('deployBox 02');
  }

  return data;
};
