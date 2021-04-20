const { readAllPursesTerm, readPursesDataTerm } = require('../src/');
const rc = require('rchain-toolkit');

module.exports.main = async (contractRegistryUri) => {
  const term0 = readAllPursesTerm(contractRegistryUri);
  const result0 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term0,
  });

  let purses = {};
  let onChainPurses = rc.utils.rhoValToJs(JSON.parse(result0).expr[0]);
  Object.keys(onChainPurses).forEach((k) => {
    purses[onChainPurses[k].id] = onChainPurses[k];
  });

  const term2 = readPursesDataTerm(contractRegistryUri, {
    pursesIds: Object.keys(purses),
  });
  const results = await Promise.all([
    rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
      term: term2,
    }),
  ]);

  return {
    purses: purses,
    pursesData: rc.utils.rhoValToJs(JSON.parse(results[0]).expr[0]),
  };
};
