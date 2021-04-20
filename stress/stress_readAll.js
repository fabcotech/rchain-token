const rc = require('rchain-toolkit');

require('dotenv').config();

const { readAllPursesTerm } = require('../src');

const main = async () => {
  const t = new Date().getTime();
  const term1 = readAllPursesTerm(
    'x41tqaw5aj4wj45dhrj1o8km7jkat5iambwz5d1bwjw5oytseshp6m'
  );
  const result1 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term1,
  });
  console.log(result1);
  const purses = rc.utils.rhoValToJs(JSON.parse(result1).expr[0]);
  console.log(`  ${Object.keys(purses).length} purses`);
  let s = '';

  s +=
    `  avg time of readAllPurses : ` +
    (new Date().getTime() - t) / 1000 +
    's\n';

  console.log(s);
  process.exit();
};

main();
