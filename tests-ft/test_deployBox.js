const { deployBoxTerm } = require('../src');
const rc = require('@fabcotech/rchain-toolkit');

module.exports.main = async (
  privateKey,
  publicKey,
  masterRegistryUri,
  boxId
) => {
  const term = deployBoxTerm({
    publicKey: publicKey,
    revAddress: rc.utils.revAddressFromPublicKey(publicKey),
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
    throw new Error('deployBox 01');
  }

  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  if (data.status !== 'completed') {
    throw new Error('deployBox 02');
  }

  return data;
};
