const rchainToolkit = require('@fabcotech/rchain-toolkit');

const { deployBoxTerm } = require('../../src');

module.exports.deployBox = async ({
  validatorHost,
  shardId,
  masterRegistryUri,
  privateKey,
  boxId,
}) => {
  const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(privateKey);

  const term = deployBoxTerm({
    masterRegistryUri: masterRegistryUri,
    boxId: boxId,
    publicKey: publicKey,
    revAddress: rchainToolkit.utils.revAddressFromPublicKey(publicKey),
  });

  dataAtNameResponse = await rchainToolkit.http.easyDeploy(
    validatorHost,
    {
      term,
      shardId: shardId,
      privateKey: privateKey,
      phloPrice: 'auto',
      phloLimit: 10000000,
      timeout: 10 * 60 * 1000
    }
  );

  const data = rchainToolkit.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  if (data.status !== 'completed') {
    throw new Error(`Error, status: ${data.status}, message: ${data.message}`);
  }

  return data.boxId;
};
