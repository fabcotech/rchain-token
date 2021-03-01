const {
  readPursesTerm,
  readPursesIdsTerm,
  readPursesDataTerm,
} = require('../src/');
const rc = require('rchain-toolkit');

module.exports.main = async (contractRegistryUri) => {
  const term0 = readPursesIdsTerm(contractRegistryUri);
  const result0 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term0,
  });

  let ids = [];
  try {
    ids = rc.utils.rhoValToJs(JSON.parse(result0).expr[0]);
  } catch (e) {}

  const term1 = readPursesTerm(contractRegistryUri, { pursesIds: ids });
  const term2 = readPursesDataTerm(contractRegistryUri, { pursesIds: ids });
  const results = await Promise.all([
    rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
      term: term1,
    }),
    rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
      term: term2,
    }),
  ]);

  return {
    purses: rc.utils.rhoValToJs(JSON.parse(results[0]).expr[0]),
    pursesData: rc.utils.rhoValToJs(JSON.parse(results[1]).expr[0]),
  };
};
