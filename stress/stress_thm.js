const rc = require('@fabcotech/rchain-toolkit');
const fs = require('fs');

require('dotenv').config();

const { validAfterBlockNumber, prepareDeploy } = require('../cli/utils');
const waitForUnforgeable = require('../cli/waitForUnforgeable').main;
const getBalance = require('../tests-ft/getBalance').main;
const { readAllPursesTerm } = require('../src');

const DEPTH = 2;
const VALUES = {
  1: '"a"',
  2: '"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"',
  3: JSON.stringify({
    id: '1',
    quantity: 2,
    box: 'aaaaaaaaaaaaa',
    publicKey: 'bbbbbbbbbbb',
  }),
};
const VALUE = VALUES[3];
const ITERATE_OVER = 200;

const PRIVATE_KEY =
  '28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36';
const PUBLIC_KEY = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY);

const balances1 = [];

const main = async () => {
  const timestamp = new Date().valueOf();
  balances1.push(await getBalance(PUBLIC_KEY));

  let term = fs.readFileSync('./stress/stress_thm.rho', 'utf8');
  let treeHashMap =
    fs.readFileSync('./rholang/tree_hash_map.rho', 'utf8') + ' |';
  term = term
    .replace(/DEPTH/g, DEPTH)
    .replace(/VALUE/g, VALUE)
    .replace(/TREE_HASH_MAP/g, treeHashMap)
    .replace(/ITERATE_OVER/g, ITERATE_OVER);

  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const pd = await prepareDeploy(
    process.env.READ_ONLY_HOST,
    PUBLIC_KEY,
    timestamp
  );

  const deployOptions = await rc.utils.getDeployOptions(
    'secp256k1',
    timestamp,
    term,
    PRIVATE_KEY,
    PUBLIC_KEY,
    1,
    500000000,
    vab || -1
  );

  try {
    const deployResponse = await rc.http.deploy(
      process.env.VALIDATOR_HOST,
      deployOptions
    );
    if (!deployResponse.startsWith('"Success!')) {
      console.log(deployResponse);
      throw new Error('error 01');
    }
  } catch (err) {
    console.log(err);
    throw new Error('error 02');
  }

  let dataAtNameResponse;
  try {
    dataAtNameResponse = await waitForUnforgeable(JSON.parse(pd).names[0]);
  } catch (err) {
    console.log(err);
    throw new Error('error 05');
  }
  balances1.push(await getBalance(PUBLIC_KEY));
  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  const dustCostPurchase =
    balances1[balances1.length - 2] - balances1[balances1.length - 1];

  let s = `  dust/phlo cost: ${dustCostPurchase} \n`;

  const t = new Date().getTime();
  const term1 = readAllPursesTerm(data.registryUri.replace('rho:id:', ''));
  const result1 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term1,
  });
  const purses = rc.utils.rhoValToJs(JSON.parse(result1).expr[0]);
  Object.keys(purses)
    .slice(0, 2)
    .forEach((k) => {
      console.log(purses[k]);
    });
  s += `  ${Object.keys(purses).length} purses\n`;

  s +=
    `  avg time of readAllPurses : ` +
    (new Date().getTime() - t) / 1000 +
    's\n';

  console.log(s);
};

main();
