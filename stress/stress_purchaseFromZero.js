const rc = require('rchain-toolkit');
const fs = require('fs');

require('dotenv').config();

const { purchaseTerm } = require('../src');
const getBalance = require('../tests-fungible/getBalance').main;
const purchase = require('./test_purchaseBatch').main;
const setPrice = require('../tests-fungible/test_setPrice').main;
const getRandomName = require('./getRandomName').main;
const deployBox = require('../tests-fungible/test_deployBox').main;
const deploy = require('../tests-fungible/test_deploy').main;
const checkDefaultPurses = require('../tests-fungible/test_checkDefaultPurses')
  .main;
const createPurses = require('./test_createPurseZero.js').main;
const checkPursesInBox = require('./checkPursesInBox.js').main;

const PURSES_TO_PURCHASE_EACH_TIME = 40;

const PRIVATE_KEY =
  '28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36';
const PUBLIC_KEY = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY);

const PRIVATE_KEY_2 =
  'a2803d16030f83757a5043e5c0e28573685f6d8bf4e358bf1385d82bffa8e698';
const PUBLIC_KEY_2 = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY_2);

const balances1 = [];
const balances2 = [];

const main = async () => {
  balances1.push(await getBalance(PUBLIC_KEY));
  balances2.push(await getBalance(PUBLIC_KEY_2));

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

  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 01 deploy');
  console.log(
    '  01 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );
  await checkDefaultPurses(boxRegistryUri);
  console.log('✓ 02 check initial bags and data');

  const contractRegistryUri = data.registryUri.replace('rho:id:', '');
  await createPurses(
    contractRegistryUri,
    PRIVATE_KEY,
    PUBLIC_KEY,
    boxRegistryUri,
    boxRegistryUri
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('  purses created');

  await setPrice(
    contractRegistryUri,
    PRIVATE_KEY,
    PUBLIC_KEY,
    boxRegistryUri,
    1,
    `0` // ID of the purse to set a price to
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('  price set');

  let lastDustCost;
  const purchasePurseBatch = async (j) => {
    const t = new Date().getTime();

    let newBoxRegistryUri;
    const newDataBox = await deployBox(PRIVATE_KEY_2, PUBLIC_KEY_2);
    newBoxRegistryUri = newDataBox.registryUri.replace('rho:id:', '');
    balances2.push(await getBalance(PUBLIC_KEY_2));

    const ids = [];
    const terms = [];
    for (let i = 0; i < PURSES_TO_PURCHASE_EACH_TIME; i += 1) {
      ids.push(getRandomName());
      terms.push(
        purchaseTerm(contractRegistryUri, {
          toBoxRegistryUri: newBoxRegistryUri,
          purseId: `0`,
          quantity: 1,
          data: 'bbb',
          newId: ids[i],
          price: 1,
          publicKey: PUBLIC_KEY_2,
        })
      );
    }

    await purchase(PRIVATE_KEY_2, PUBLIC_KEY_2, terms.join(' | \n'));

    balances2.push(await getBalance(PUBLIC_KEY_2));

    const dustCost =
      balances2[balances2.length - 2] - balances2[balances2.length - 1];
    const dustCostDiff = lastDustCost ? dustCost - lastDustCost : 0;
    lastDustCost = dustCost;
    let s = '';
    s += `✓ ${j} purchase ${ids.length} purses from purse 0\n`;
    s +=
      `  ${j} dust cost (setPrice): ` +
      dustCost +
      '(diff: ' +
      dustCostDiff +
      ')\n';
    s +=
      `  ${j} avg time of deploy+propose : ` +
      (new Date().getTime() - t) / 1000 +
      's\n';
    await checkPursesInBox(
      newBoxRegistryUri,
      contractRegistryUri,
      PURSES_TO_PURCHASE_EACH_TIME
    );
    return s;
  };

  const time = (new Date().getTime() + '').slice(0, 10);
  const filename = `./stress_purchaseFromZero_logs_${time}.txt`;

  for (let j = 0; j < 1000000; j += 1) {
    if (j === 0) {
      fs.writeFileSync(
        filename,
        `PURCHASE_PURSE_FROM_PURSE_ZERO\nPURSES_TO_PURCHASE_EACH_TIME: ${PURSES_TO_PURCHASE_EACH_TIME}\nHOST=${process.env.VALIDATOR_HOST}\n`,
        'utf8'
      );
    }
    const s = '  ' + new Date().toString() + '\n';
    '  batch no ' + j + ' will purchase 1 purse\n';
    const res = await purchasePurseBatch(j);
    let logs = '';
    try {
      logs = fs.readFileSync(filename, 'utf8');
    } catch (e) {}
    fs.writeFileSync(filename, logs + s + res, 'utf8');
  }
};

main();
