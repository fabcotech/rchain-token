const rc = require('rchain-toolkit');

require('dotenv').config();

const { readAllPursesTerm, decodePurses } = require('../src');

const CONTRACT_REGISTRY_URI =
  'duikc8nkffd7cytgnugwjinqqdxw3xch1src43woqto6bbdxsw5p6q';

const main = async () => {
  const t = new Date().getTime();
  const term1 = readAllPursesTerm(CONTRACT_REGISTRY_URI);
  const result1 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term1,
  });
  console.log(result1);

  const pursesAsBytes = JSON.parse(result1).expr[0];

  let s = '';

  s +=
    `  avg time of readAllPurses : ` +
    (new Date().getTime() - t) / 1000 +
    's\n';

  const t2 = new Date().getTime();
  const purses = decodePurses(pursesAsBytes);

  s +=
    `  avg time of decode bytes in javascript : ` +
    (new Date().getTime() - t2) / 1000 +
    's\n';

  console.log(`  ${Object.keys(purses).length} purses`);

  console.log(s);
  process.exit();
};

main();
