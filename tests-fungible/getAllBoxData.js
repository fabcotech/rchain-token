const { readBoxTerm } = require('../src');
const rc = require('rchain-toolkit');

module.exports.main = async (masterRegistryUri, boxId) => {
  const term0 = readBoxTerm({ masterRegistryUri: masterRegistryUri, boxId: boxId});
  const result0 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term0,
  });
  console.log(rc.utils.rhoValToJs(JSON.parse(result0).expr[0]))

  return rc.utils.rhoValToJs(JSON.parse(result0).expr[0]);
};
