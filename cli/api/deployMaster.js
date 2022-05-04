const rchainToolkit = require('@fabcotech/rchain-toolkit');

const { masterTerm } = require('../../src/');
const {
  getDepth,
  getContractDepth,
} = require('../utils');

module.exports.deployMaster = async ({
  validatorHost,
  shardId,
  privateKey,
}) => {
  const term = masterTerm({
    depth: getDepth() || 3,
    contractDepth: getContractDepth() || 2,
  });

  const dataAtNameResponse = await rchainToolkit.http.easyDeploy(
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

  return data.registryUri.replace('rho:id:', '');
};
