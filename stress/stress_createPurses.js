const rc = require('rchain-toolkit');
const fs = require('fs');

require('dotenv').config();

const getBalance = require('../tests-fungible/getBalance').main;
const getRandomName = require('./getRandomName').main;
const deployBox = require('../tests-fungible/test_deployBox').main;
const deploy = require('../tests-fungible/test_deploy').main;
const checkDefaultPurses = require('../tests-fungible/test_checkDefaultPurses')
  .main;
const createPurses = require('./test_createPurses.js').main;
const checkPursesInBox = require('./checkPursesInBox.js').main;

const PURSES_TO_CREATE = 10;
const PURSES_TO_CREATE_INITIAL = 10;
const NEW_BOX_EACH_TIME = true;

const PRIVATE_KEY =
  '28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36';
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
    2
  );
  const contractRegistryUri = data.registryUri.replace('rho:id:', '');
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 01 deploy');
  console.log(
    '  01 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );
  await checkDefaultPurses(boxRegistryUri);
  console.log('✓ 02 check initial bags and data');

  let lastDustCost;
  const createPursesBatch = async (j) => {
    const t = new Date().getTime();
    const ids = [];
    for (
      let i = 0;
      i < (j === 0 ? PURSES_TO_CREATE_INITIAL : PURSES_TO_CREATE);
      i += 1
    ) {
      ids.push(getRandomName());
    }

    let newBoxRegistryUri;
    if (NEW_BOX_EACH_TIME && j !== 0) {
      const newDataBox = await deployBox(PRIVATE_KEY, PUBLIC_KEY);
      newBoxRegistryUri = newDataBox.registryUri.replace('rho:id:', '');
      balances1.push(await getBalance(PUBLIC_KEY));
    }

    await createPurses(
      contractRegistryUri,
      PRIVATE_KEY,
      PUBLIC_KEY,
      boxRegistryUri,
      NEW_BOX_EACH_TIME && j !== 0 ? newBoxRegistryUri : boxRegistryUri,
      ids
    );
    balances1.push(await getBalance(PUBLIC_KEY));
    const dustCost =
      balances1[balances1.length - 2] - balances1[balances1.length - 1];
    const dustCostDiff = lastDustCost ? dustCost - lastDustCost : 0;
    lastDustCost = dustCost;
    let s = '';
    s += `✓ ${j} create ${PURSES_TO_CREATE} purses\n`;
    s += `  ${j} dust cost: ` + dustCost + '(diff: ' + dustCostDiff + ')\n';
    s +=
      `  ${j} avg time of deploy+propose : ` +
      (new Date().getTime() - t) / 1000 +
      's\n';
    if (NEW_BOX_EACH_TIME && j !== 0) {
      await checkPursesInBox(
        newBoxRegistryUri,
        contractRegistryUri,
        PURSES_TO_CREATE
      );
    } else if (j === 0) {
      await checkPursesInBox(
        boxRegistryUri,
        contractRegistryUri,
        PURSES_TO_CREATE_INITIAL
      );
    } else {
      await checkPursesInBox(
        boxRegistryUri,
        contractRegistryUri,
        PURSES_TO_CREATE_INITIAL + PURSES_TO_CREATE * (j + 1)
      );
    }
    return s;
  };

  const time = (new Date().getTime() + '').slice(0, 10);
  const filename = `./stress_create_purses_logs_${time}.txt`;

  for (let j = 0; j < 1000000; j += 1) {
    if (j === 0) {
      fs.writeFileSync(
        filename,
        `CREATE_PURSES\nPURSES_TO_CREATE: ${PURSES_TO_CREATE}\nPURSES_TO_CREATE_INITIAL: ${PURSES_TO_CREATE_INITIAL}\nNEW_BOX_EACH_TIME: ${NEW_BOX_EACH_TIME}\nHOST=${process.env.VALIDATOR_HOST}\n`,
        'utf8'
      );
    }
    const s = '  ' + new Date().toString() + '\n';
    '  batch no ' +
      j +
      ' will create (current: ' +
      (j + 1) * PURSES_TO_CREATE +
      ') + ' +
      PURSES_TO_CREATE +
      ' purses\n';
    const res = await createPursesBatch(j);
    console.log('ok');
    let logs = '';
    try {
      logs = fs.readFileSync(filename, 'utf8');
    } catch (e) {}
    fs.writeFileSync(filename, logs + s + res, 'utf8');
  }
};

main();
