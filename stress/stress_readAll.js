const rc = require('rchain-toolkit');

require('dotenv').config();

const { readAllPursesTerm } = require('../src');

const CONTRACT_REGISTRY_URI =
  'mpaijgz9fhghtdpouop14uq6apuou7ikts6ncx43pgam1byq1r5dwx';

const main = async () => {
  const t = new Date().getTime();
  const term1 = readAllPursesTerm(CONTRACT_REGISTRY_URI);
  const result1 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term1,
  });
  const purses = {};
  const pursesOnChain = JSON.parse(result1).expr[0];

  let s = '';

  s +=
    `  avg time of readAllPurses : ` +
    (new Date().getTime() - t) / 1000 +
    's\n';

  const t2 = new Date().getTime();
  Object.keys(pursesOnChain.ExprMap.data).forEach((k) => {
    const a = pursesOnChain.ExprMap.data[k];
    if (a && a.ExprBytes && a.ExprBytes.data) {
      const b = Buffer.from(a.ExprBytes.data, 'hex');
      try {
        const valJs = rc.utils.rhoExprToVar(rc.utils.decodePar(b).exprs[0]);
        purses[valJs.id] = valJs;
      } catch (err) {
        console.log(err);
      }
    }
  });

  s +=
    `  avg time of decode bytes in javascript : ` +
    (new Date().getTime() - t2) / 1000 +
    's\n';

  console.log(
    `  ${
      Object.keys(pursesOnChain.ExprMap.data).length
    } hashes in tree hash map`
  );
  console.log(`  ${Object.keys(purses).length} purses`);

  console.log(s);
  process.exit();
};

main();
