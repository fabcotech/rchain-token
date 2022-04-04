const rc = require('@fabcotech/rchain-toolkit');

require('dotenv').config();

const {
  readAllPursesTerm,
  decodePurses,
  readPursesDataTerm,
  readPursesTerm,
} = require('../src');
const getBalance = require('../tests-ft/getBalance').main;
const getRandomName = require('../tests-nft/getRandomName').main;
const deployBox = require('../tests-ft/test_deployBox').main;
const deployMaster = require('../tests-ft/test_deployMaster').main;
const deploy = require('../tests-ft/test_deploy').main;

const createPurses = require('./test_createPurses.js').main;

const PURSES_TO_CREATE_INITIAL = 100;

const PRIVATE_KEY =
  '28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36';
const PUBLIC_KEY = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY);

const balances1 = [];

let boxId = 'box';
let contractId = 'mytoken';
const main = async () => {
  balances1.push(await getBalance(PUBLIC_KEY));

  const data = await deployMaster(PRIVATE_KEY, PUBLIC_KEY);
  const masterRegistryUri = data.registryUri.replace('rho:id:', '');
  console.log('✓ 00 deploy master');

  const dataBox = await deployBox(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId
  );
  boxId = dataBox.boxId;
  console.log('  Box ID : ' + boxId);
  balances1.push(await getBalance(PUBLIC_KEY));

  console.log('✓ 01 deploy box');
  console.log(
    '  01 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  const deployData = await deploy(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId,
    false,
    contractId,
    null
  );
  contractId = deployData.contractId;
  console.log('  Contract ID : ' + contractId);

  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 02 deploy contract');
  console.log(
    '  02 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  const ids = [];
  for (let i = 0; i < PURSES_TO_CREATE_INITIAL; i += 1) {
    ids.push(getRandomName());
  }
  const t = new Date().getTime();
  const resultCreatePurses = await createPurses(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    contractId,
    boxId,
    boxId,
    ids
  );
  console.log(JSON.stringify(resultCreatePurses, null, 2));

  let s =
    '  ' + PURSES_TO_CREATE_INITIAL + ' purses (elements in tree hash map):\n';
  s +=
    `  avg time of createPurses : ` + (new Date().getTime() - t) / 1000 + 's\n';

  const t1 = new Date().getTime();
  const term1 = readAllPursesTerm({
    masterRegistryUri: masterRegistryUri,
    contractId: contractId,
    depth: 2,
  });
  const result1 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term1,
  });

  const pursesAsBytes = JSON.parse(result1).expr[0];

  s +=
    `  avg time of readAllPurses : ` +
    (new Date().getTime() - t1) / 1000 +
    's\n';

  const t2 = new Date().getTime();
  const purses = decodePurses(
    pursesAsBytes,
    rc.utils.rhoExprToVar,
    rc.utils.decodePar
  );

  s +=
    `  avg time of decodePurses : ` +
    (new Date().getTime() - t2) / 1000 +
    's\n';

  const t3 = new Date().getTime();
  const term2 = readPursesDataTerm({
    masterRegistryUri: masterRegistryUri,
    contractId: contractId,
    pursesIds: Object.keys(purses),
  });
  const result2 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term2,
  });
  const data2 = rc.utils.rhoValToJs(JSON.parse(result2).expr[0]);

  s +=
    `  avg time of readPursesDataTerm : ` +
    (new Date().getTime() - t3) / 1000 +
    's\n';

  const t4 = new Date().getTime();
  const term3 = readPursesTerm({
    masterRegistryUri: masterRegistryUri,
    contractId: contractId,
    pursesIds: Object.keys(purses),
  });
  const result3 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term3,
  });
  const data3 = rc.utils.rhoValToJs(JSON.parse(result3).expr[0]);

  s +=
    `  avg time of readPursesTerm : ` +
    (new Date().getTime() - t4) / 1000 +
    's\n';

  console.log(s);
};

main();
