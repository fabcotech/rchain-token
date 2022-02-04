const rchainToolkit = require('rchain-toolkit');

const { deployBoxTerm } = require('../../src');

module.exports.deployBox = async ({
  validatorHost,
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

  const dataAtNameResponse = await rchainToolkit.http.easyDeploy(
    validatorHost,
    term,
    privateKey,
    1,
    10000000,
    10 * 60 * 1000
  );

  const data = rchainToolkit.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  if (data.status !== 'completed') {
    throw new Error(`Error, status: ${data.status}, message: ${data.message}`);
  }

  return data.boxId;
};
