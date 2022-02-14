const rchainToolkit = require('rchain-toolkit');
const { createPursesTerm } = require('../../src');

module.exports.createPurse = async ({
  masterRegistryUri,
  validatorHost,
  privateKey,
  contractId,
  purses,
  pursesData,
}) => {
  const payload = {
    masterRegistryUri,
    contractId,
    purses,
    data: pursesData 
  }
  const term = createPursesTerm(payload);

  const data = await rchainToolkit.http.easyDeploy(
    validatorHost,
    term,
    privateKey,
    1,
    10000000
    // 10 * 60 * 1000
  );

  console.log(data);

  if (!data.startsWith('"Success!')) {
    throw new Error(`Deploy status: ${data.status}, message: ${data.message}`);
  }

  return data;
};
