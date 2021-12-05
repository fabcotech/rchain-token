const rc = require('rchain-toolkit');
const { readConfigTerm } = require('../src');

module.exports.main = async (masterRegistryUri, contractId, fee) => {
  const term0 = readConfigTerm({ masterRegistryUri: masterRegistryUri, contractId: contractId});
  const result0 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term0,
  });

  const config = rc.utils.rhoValToJs(JSON.parse(result0).expr[0]);

  if (fee === null) {
    if (config.fee) {
      throw new Error('config.fee should be null')
    }
  } else {
    if (config.fee[0] !== fee[0] || config.fee[1] !== fee[1]) {
      throw new Error(`config.fee is invalid, should be [${fee[0]},${fee[1]}]`)
    }
  }

  return null;
};
