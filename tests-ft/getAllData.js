const {
  readAllPursesTerm,
  readPursesDataTerm,
  decodePurses,
} = require('../src');
const rc = require('rchain-toolkit');

module.exports.main = async (masterRegistryUri, contractId) => {
  const term0 = readAllPursesTerm({masterRegistryUri, contractId });
  const result0 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term0,
  });
  const pursesAsBytes = JSON.parse(result0).expr[0];

  const purses = decodePurses(
    pursesAsBytes,
    rc.utils.rhoExprToVar,
    rc.utils.decodePar
  );

  const term2 = readPursesDataTerm({
    masterRegistryUri: masterRegistryUri,
    pursesIds: Object.keys(purses),
    contractId: contractId,
  });

  const result1 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term2,
  })

  return {
    purses: purses,
    pursesData: rc.utils.rhoValToJs(JSON.parse(result1).expr[0]),
  };
};
