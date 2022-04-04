const rc = require('rchain-toolkit');

require('dotenv').config();

const { readAllPursesTerm, decodePurses } = require('../src');

const MASTER_REGISTRY_URI =
  '39ygm3eb67r87askc9kxfpimaj73184moph3nmh355wjtztzxtu84d';
const CONTRACT_ID = '39ymytoken';

const main = async () => {
  const t = new Date().getTime();
  const term1 = readAllPursesTerm({
    masterRegistryUri: MASTER_REGISTRY_URI,
    contractId: CONTRACT_ID,
    depth: 2,
  });
  const result1 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term1,
  });

  const pursesAsBytes = JSON.parse(result1).expr[0];

  let s = '';

  s +=
    `  avg time of readAllPurses : ` +
    (new Date().getTime() - t) / 1000 +
    's\n';

  const t2 = new Date().getTime();
  const purses = decodePurses(
    pursesAsBytes,
    rc.utils.rhoExprToVar,
    rc.utils.decodePar
  );

  s +=
    `  avg time of decode bytes in javascript : ` +
    (new Date().getTime() - t2) / 1000 +
    's\n';

  s = `  ${Object.keys(purses).length} purses\n` + s;

  console.log(s);
  process.exit();
};

main();
