const {
  readAllPursesTerm,
  readPursesDataTerm,
  decodePurses,
} = require('../src/');
const rc = require('rchain-toolkit');

module.exports.main = async (masterRegistryUri, contractId) => {
  const term0 = readAllPursesTerm({masterRegistryUri, contractId });
  const result0 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term0,
  });
  const pursesOnChain = JSON.parse(result0).expr[0];
  const purses = decodePurses(
    pursesOnChain,
    rc.utils.rhoExprToVar,
    rc.utils.decodePar
  );

  const term2 = readPursesDataTerm(masterRegistryUri, {
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
