const rchainToolkit = require('@fabcotech/rchain-toolkit');

const { creditTerm } = require('../src');

const {
  getBoxId,
  getQuantity,
  getMasterRegistryUri,
} = require('./utils');

module.exports.credit = async () => {
  const masterRegistryUri = getMasterRegistryUri();
  const boxId = getBoxId();
  const quantity = getQuantity();
  if (!quantity) {
    throw new Error('Please provide a quantity with --quantity option');
  }

  const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(process.env.PRIVATE_KEY);
  const term = creditTerm(    {
    revAddress: rchainToolkit.utils.revAddressFromPublicKey(publicKey),
    quantity: quantity,
    masterRegistryUri: masterRegistryUri,
    boxId: boxId
  });

  let dataAtNameResponse;
  try {
    dataAtNameResponse = await rchainToolkit.http.easyDeploy(
      process.env.VALIDATOR_HOST,
      term,
      process.env.PRIVATE_KEY,
      1,
      10000000,
      10 * 60 * 1000
    );
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }

  const data = rchainToolkit.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );
  console.log(data);
};
