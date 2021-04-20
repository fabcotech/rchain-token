const rc = require('rchain-toolkit');
require('dotenv').config();

const getBalance = require('../tests-fungible/getBalance').main;
const getRandomName = require('./getRandomName').main;
const getAllBoxData = require('../tests-fungible/getAllBoxData').main;
const deployBox = require('../tests-fungible/test_deployBox').main;
const deploy = require('../tests-fungible/test_deploy').main;
const purchase = require('../tests-fungible/test_purchase').main;
const checkDefaultPurses = require('../tests-fungible/test_checkDefaultPurses')
  .main;
const checkPurseDataInContract = require('../tests-fungible/checkPurseDataInContract.js')
  .main;
const checkPursePriceInContract = require('../tests-fungible/checkPursePriceInContract.js')
  .main;
const setPrice = require('../tests-fungible/test_setPrice.js').main;
const createPurses = require('./test_createPurses.js').main;
const updatePurseData = require('../tests-fungible/test_updatePurseData.js')
  .main;
const checkPursesInContract = require('./checkPursesInContract.js').main;
const checkPursesInBox = require('./checkPursesInBox.js').main;
const sendPurse = require('../tests-fungible/test_sendPurse.js').main;

const PURSES_TO_CREATE = 10;

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

  const secondDataBox = await deployBox(PRIVATE_KEY_2, PUBLIC_KEY_2);
  const secondBoxRegistryUri = secondDataBox.registryUri.replace('rho:id:', '');
  balances2.push(await getBalance(PUBLIC_KEY_2));

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

  const t = new Date().getTime();
  const ids = [];
  for (let i = 0; i < PURSES_TO_CREATE; i += 1) {
    ids.push(getRandomName());
  }

  await createPurses(
    contractRegistryUri,
    PRIVATE_KEY,
    PUBLIC_KEY,
    boxRegistryUri,
    ids
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log(`✓ 03 create ${PURSES_TO_CREATE} bags`);
  console.log(
    '  03 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );
  console.log(
    `  03 avg time of deploy+propose : ` +
      (new Date().getTime() - t) / 1000 +
      's'
  );
  await checkPursesInBox(
    boxRegistryUri,
    contractRegistryUri,
    ['0'].concat(ids)
  );
  await checkPursesInContract(contractRegistryUri, ['0'].concat(ids));
  console.log(
    `✓ 04 check the presence of ${PURSES_TO_CREATE} purses with the right ids`
  );

  // send from box 1 to box 2
  await sendPurse(
    contractRegistryUri,
    PRIVATE_KEY,
    PUBLIC_KEY,
    boxRegistryUri,
    secondBoxRegistryUri,
    ids[0] // ID of the purse to send
  );

  await checkPursesInContract(contractRegistryUri, ['0'].concat(ids));
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 05 send one purse from box 1 to box 2');
  console.log(
    '  05 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );
  await checkPursesInBox(
    boxRegistryUri,
    contractRegistryUri,
    ['0'].concat(ids.filter((a, i) => i !== 0))
  );
  await checkPursesInBox(secondBoxRegistryUri, contractRegistryUri, [ids[0]]);
  // send from box 2 to box 1
  await sendPurse(
    contractRegistryUri,
    PRIVATE_KEY_2,
    PUBLIC_KEY_2,
    secondBoxRegistryUri,
    boxRegistryUri,
    ids[0] // ID of the purse to send
  );
  await checkPursesInContract(contractRegistryUri, ['0'].concat(ids));
  await checkPursesInBox(
    boxRegistryUri,
    contractRegistryUri,
    ['0'].concat(ids)
  );
  await checkPursesInBox(secondBoxRegistryUri, contractRegistryUri, []);
  balances2.push(await getBalance(PUBLIC_KEY_2));
  console.log('✓ 06 send one purse from box 2 to box 1');
  console.log(
    '  06 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );

  await updatePurseData(
    contractRegistryUri,
    PRIVATE_KEY,
    PUBLIC_KEY,
    boxRegistryUri,
    ids[0],
    'aaa'
  );
  await checkPurseDataInContract(contractRegistryUri, ids[0], 'aaa');
  console.log(`✓ 07 update data associated to purse`);
  console.log(
    '  07 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await setPrice(
    contractRegistryUri,
    PRIVATE_KEY,
    PUBLIC_KEY,
    boxRegistryUri,
    10,
    ids[0]
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  await checkPursePriceInContract(contractRegistryUri, ids[0], 10);
  console.log(`✓ 08 set a price to a purse`);
  console.log(
    '  08 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  const balance1BeforePurchase = balances1[balances1.length - 1];
  await purchase(contractRegistryUri, PRIVATE_KEY_2, PUBLIC_KEY_2, {
    toBoxRegistryUri: secondBoxRegistryUri,
    newId: null,
    purseId: ids[0],
    data: 'bbb',
    quantity: 1,
    price: 10,
    publicKey: PUBLIC_KEY_2,
  });

  await checkPursesInBox(secondBoxRegistryUri, contractRegistryUri, [ids[0]]);
  await checkPursesInBox(
    boxRegistryUri,
    contractRegistryUri,
    ['0'].concat(ids.filter((a, i) => i !== 0))
  );
  await checkPursesInContract(contractRegistryUri, ['0'].concat(ids));

  console.log(`✓ 10 purchase`);
  console.log(`✓ 10 balance of purse's owner checked and has +10 dust`);
  const balance1AfterPurchase = await getBalance(PUBLIC_KEY);
  if (balance1BeforePurchase + 10 !== balance1AfterPurchase) {
    throw new Error('owner of box 1 did not receive payment from purchase');
  }

  balances1.push(await getBalance(PUBLIC_KEY_2));
  console.log(
    '  10 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );

  await setPrice(
    contractRegistryUri,
    PRIVATE_KEY,
    PUBLIC_KEY,
    boxRegistryUri,
    1000,
    '0'
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  await checkPursePriceInContract(contractRegistryUri, '0', 1000);

  await purchase(contractRegistryUri, PRIVATE_KEY_2, PUBLIC_KEY_2, {
    toBoxRegistryUri: secondBoxRegistryUri,
    newId: 'amazoon',
    purseId: '0',
    quantity: 1,
    price: 1000,
    publicKey: PUBLIC_KEY_2,
  });
  balances2.push(await getBalance(PUBLIC_KEY_2));

  await checkPursesInBox(secondBoxRegistryUri, contractRegistryUri, [
    ids[0],
    'amazoon',
  ]);
  await checkPursesInContract(
    contractRegistryUri,
    ['0', 'amazoon'].concat(ids)
  );
  if (
    balances1[balances1.length - 1] + 1000 !==
    (await getBalance(PUBLIC_KEY))
  ) {
    throw new Error("owner of purse '0' did not receive payment from purchase");
  }
};

main();
