const {
  readAllPursesTerm,
  readPursesIdsTerm,
  readPursesDataTerm,
} = require('../src/');
const rc = require('rchain-toolkit');

module.exports.main = async (contractRegistryUri) => {
  const term1 = readAllPursesTerm(contractRegistryUri, {});
  const result1 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term1,
  });
  const purses = {};

  rc.utils.rhoValToJs(JSON.parse(result1).expr[0]).forEach((p) => {
    purses[p.id] = p;
  });

  const term2 = readPursesDataTerm(contractRegistryUri, {
    pursesIds: Object.keys(purses),
  });
  const result2 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term2,
  });
  const pursesData = rc.utils.rhoValToJs(JSON.parse(result2).expr[0]);

  return {
    purses: purses,
    pursesData: pursesData,
  };
};
