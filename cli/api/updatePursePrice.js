const rchainToolkit = require('rchain-toolkit');

const { updatePursePriceTerm } = require('../../src');

module.exports.updatePursePrice = async ({
  masterRegistryUri,
  validatorHost,
  privateKey,
  contractId,
  boxId,
  purseId,
  price,
}) => {
  let [currency, amount] = price;

  if (currency === 'rev') {
    currency = `${masterRegistryUri.slice(0, 3)}rev`;
  }

  currency = `"${currency.replace("\"", "")}"`;
  amount = /^\d+$/.test(amount) ? amount : `"${amount.replace("\"", "")}"`;

  const term = updatePursePriceTerm({
    masterRegistryUri,
    boxId,
    contractId,
    price: [currency, amount],
    purseId,
  });

  const response = await rchainToolkit.http.easyDeploy(
    validatorHost,
    term,
    privateKey,
    1,
    10000000,
    10 * 60 * 1000
  );

  const data = rchainToolkit.utils.rhoValToJs(
    JSON.parse(response).exprs[0].expr
  );

  if (data.status !== 'completed') {
    throw new Error(`Deploy status: ${data.status}, message: ${data.message}`);
  }

  return data;
};
