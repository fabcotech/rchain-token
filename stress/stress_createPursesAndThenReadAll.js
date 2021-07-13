const rc = require('rchain-toolkit');

require('dotenv').config();

const { readAllPursesTerm, decodePurses } = require('../src');
const getBalance = require('../tests-ft/getBalance').main;
const getRandomName = require('./getRandomName').main;
const deployBox = require('../tests-ft/test_deployBox').main;
const deploy = require('../tests-ft/test_deploy').main;
const checkDefaultPurses = require('../tests-ft/test_checkDefaultPurses')
  .main;
const createPurses = require('./test_createPurses.js').main;
const checkPursesInBox = require('./checkPursesInBox.js').main;

const PURSES_TO_CREATE_INITIAL = 150;
const DEPTH = 2;

const PRIVATE_KEY =
  'a2803d16030f83757a5043e5c0e28573685f6d8bf4e358bf1385d82bffa8e698';
const PUBLIC_KEY = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY);

const balances1 = [];

const main = async () => {
  balances1.push(await getBalance(PUBLIC_KEY));

  const dataBox = await deployBox(PRIVATE_KEY, PUBLIC_KEY);
  const boxRegistryUri = dataBox.registryUri.replace('rho:id:', '');
  balances1.push(await getBalance(PUBLIC_KEY));

  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 00 deploy boxes');
  console.log(
    '  00 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  const data = await deploy(
    PRIVATE_KEY,
    PUBLIC_KEY,
    boxRegistryUri,
    false,
    'mytoken',
    null,
    DEPTH
  );

  const contractRegistryUri = data.registryUri.replace('rho:id:', '');
  console.log('  contractRegistryUri : ' + contractRegistryUri);
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 01 deploy');
  console.log(
    '  01 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );
  await checkDefaultPurses(boxRegistryUri);
  console.log('✓ 02 check initial bags and data');

  const createPursesBatch = async (j) => {
    const ids = [];
    for (let i = 0; i < PURSES_TO_CREATE_INITIAL; i += 1) {
      ids.push(getRandomName());
    }

    await createPurses(
      contractRegistryUri,
      PRIVATE_KEY,
      PUBLIC_KEY,
      boxRegistryUri,
      boxRegistryUri,
      ids
    );
    balances1.push(await getBalance(PUBLIC_KEY));
    console.log('okokokokok');
    console.log(`✓ created ${PURSES_TO_CREATE_INITIAL} purses`);

    await checkPursesInBox(
      boxRegistryUri,
      contractRegistryUri,
      PURSES_TO_CREATE_INITIAL
    );
  };
  await createPursesBatch();

  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 03 create purses');
  console.log(
    '  03 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  const t = new Date().getTime();
  const term1 = readAllPursesTerm(contractRegistryUri);
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
