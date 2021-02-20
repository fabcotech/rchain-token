const { readBagsTerm } = require('../src/readBagsTerm');
const { readBagsIdsTerm } = require('../src/readBagsIdsTerm');
const { readBagsOrTokensDataTerm } = require('../src/readBagsOrTokensDataTerm');
const rc = require('rchain-toolkit');

module.exports.main = async (registryUri) => {
  const term0 = readBagsIdsTerm(registryUri);
  const result0 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term0,
  });

  let ids = [];
  try {
    ids = rc.utils.rhoValToJs(JSON.parse(result0).expr[0]);
  } catch (e) {}

  const term1 = readBagsTerm(registryUri, ids);
  const term2 = readBagsOrTokensDataTerm(registryUri, 'tokens', []);
  const term3 = readBagsOrTokensDataTerm(registryUri, 'bags', ids);

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

  const expr1 = JSON.parse(results[0]).expr[0];
  const bags = expr1 ? rc.utils.rhoValToJs(expr1) : {};
  const expr2 = JSON.parse(results[1]).expr[0];
  const tokensData = expr2 ? rc.utils.rhoValToJs(expr2) : {};
  const expr3 = JSON.parse(results[2]).expr[0];
  const bagsData = expr3 ? rc.utils.rhoValToJs(expr3) : {};

  return {
    bags: bags,
    tokensData: tokensData,
    bagsData: bagsData,
  };
};
