const { readBagsTerm } = require('../src/readBagsTerm');
const { readBagsOrTokensDataTerm } = require('../src/readBagsOrTokensDataTerm');
const rc = require('rchain-toolkit');

module.exports.main = async (registryUri) => {
  const term1 = readBagsTerm(registryUri);
  const term2 = readBagsOrTokensDataTerm(registryUri, 'tokens');
  const term3 = readBagsOrTokensDataTerm(registryUri, 'bags');

  const results = await Promise.all([
    rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
      term: term1,
    }),
    rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
      term: term2,
    }),
    rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
      term: term3,
    }),
  ]);

  const bags = rc.utils.rhoValToJs(JSON.parse(results[0]).expr[0]);
  const tokensData = rc.utils.rhoValToJs(JSON.parse(results[1]).expr[0]);
  const bagsData = rc.utils.rhoValToJs(JSON.parse(results[2]).expr[0]);

  return {
    bags: bags,
    tokensData: tokensData,
    bagsData: bagsData,
  };

  return null;
};
