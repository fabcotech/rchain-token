const { readBoxTerm } = require('../src/');
const rc = require('rchain-toolkit');

module.exports.main = async (boxRegistryUri) => {
  const term0 = readBoxTerm(boxRegistryUri);
  const result0 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term0,
  });

  return rc.utils.rhoValToJs(JSON.parse(result0).expr[0]);
};
