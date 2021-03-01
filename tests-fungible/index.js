const rc = require('rchain-toolkit');
require('dotenv').config();

const getBalance = require('./getBalance').main;
const getAllBoxData = require('./getAllBoxData').main;
const deployBox = require('./00_deployBox').main;
const deploy = require('./01_deploy').main;
const checkDefaultPurses = require('./01_checkDefaultPurses').main;
const createPurses = require('./03_createPurses.js').main;
const checkPursesInContract = require('./checkPursesInContract.js').main;
const checkPurseDataInContract = require('./checkPurseDataInContract.js').main;
const checkPursesInBox = require('./checkPursesInBox.js').main;
const sendPurse = require('./05_sendPurse.js').main;
const updatePurseData = require('./06_updatePurseData.js').main;
const checkBagData = require('./08_checkBagData.js').main;
const checkBagsAndTokens4 = require('./10_checkBagsAndTokens.js').main;
const changePrice = require('./11_changePrice').main;
const checkBagPrice = require('./12_checkBagPrice').main;
const tryPurchase = require('./14_tryPurchase').main;

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
  const secondDataBox = await deployBox(PRIVATE_KEY_2, PUBLIC_KEY_2);
  const secondBoxRegistryUri = secondDataBox.registryUri.replace('rho:id:', '');

  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 00 deploy boxes');
  console.log(
    '  00 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  const data = await deploy(PRIVATE_KEY, PUBLIC_KEY, boxRegistryUri, true);
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
  await createPurses(
    contractRegistryUri,
    PRIVATE_KEY,
    PUBLIC_KEY,
    boxRegistryUri,
    PURSES_TO_CREATE
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
  await checkPursesInBox(boxRegistryUri, contractRegistryUri, PURSES_TO_CREATE);
  await checkPursesInContract(
    contractRegistryUri,
    PURSES_TO_CREATE,
    PURSES_TO_CREATE,
    3
  );
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
    '' + PURSES_TO_CREATE // ID of the purse to send
  );

  await checkPursesInContract(
    contractRegistryUri,
    PURSES_TO_CREATE,
    PURSES_TO_CREATE * 2,
    3
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 05 send one purse from box 1 to box 2');
  console.log(
    '  05 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );
  await checkPursesInBox(
    boxRegistryUri,
    contractRegistryUri,
    PURSES_TO_CREATE - 1
  );
  await checkPursesInBox(secondBoxRegistryUri, contractRegistryUri, 1);

  // send from box 2 to box 1
  await sendPurse(
    contractRegistryUri,
    PRIVATE_KEY_2,
    PUBLIC_KEY_2,
    secondBoxRegistryUri,
    boxRegistryUri,
    '' + PURSES_TO_CREATE * 2 // ID of the purse to send
  );
  await checkPursesInContract(
    contractRegistryUri,
    PURSES_TO_CREATE,
    PURSES_TO_CREATE * 2 + 1,
    3
  );
  await checkPursesInBox(boxRegistryUri, contractRegistryUri, PURSES_TO_CREATE);
  await checkPursesInBox(secondBoxRegistryUri, contractRegistryUri, 0);
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
    '' + (PURSES_TO_CREATE + 1), // bag 11 that probably has not been sent
    'aaa'
  );
  await checkPurseDataInContract(
    contractRegistryUri,
    '' + (PURSES_TO_CREATE + 1),
    'aaa'
  );

  process.exit();
  const lastBag = await checkBagsAndTokens3(
    data.registryUri.replace('rho:id:', ''),
    PURSES_TO_CREATE,
    PUBLIC_KEY_2
  );
  console.log(`✓ 06 check the presence of ${PURSES_TO_CREATE + 1} bags`);
  await updateBagData(
    data.registryUri.replace('rho:id:', ''),
    lastBag.nonce,
    PURSES_TO_CREATE,
    PRIVATE_KEY_2,
    PUBLIC_KEY_2
  );
  balances2.push(await getBalance(PUBLIC_KEY_2));
  console.log(`✓ 07 update data associated with bag ${PURSES_TO_CREATE}`);
  console.log(
    '  07 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );
  const bagPurchased = await checkBagData(
    data.registryUri.replace('rho:id:', ''),
    PURSES_TO_CREATE
  );
  console.log(`✓ 08 check data associated with bag ${PURSES_TO_CREATE}`);
  const allData = await getAllBoxData(data.registryUri.replace('rho:id:', ''));
  await sendTokens(
    data.registryUri.replace('rho:id:', ''),
    allData.bags['1'].nonce,
    PRIVATE_KEY,
    PUBLIC_KEY
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log(`✓ 09 send 1 token from bag 1`);
  console.log(
    '  09 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );
  await checkBagsAndTokens4(
    data.registryUri.replace('rho:id:', ''),
    PURSES_TO_CREATE
  );
  console.log(`✓ 10 check the presence of ${PURSES_TO_CREATE + 2} bags`);
  await changePrice(
    data.registryUri.replace('rho:id:', ''),
    bagPurchased.nonce,
    PRIVATE_KEY_2,
    PUBLIC_KEY_2,
    PURSES_TO_CREATE
  );
  balances2.push(await getBalance(PUBLIC_KEY_2));
  await checkBagPrice(
    data.registryUri.replace('rho:id:', ''),
    PURSES_TO_CREATE
  );
  console.log('✓ 11 changed price of a bag');
  console.log(
    '  11 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );
  await tryPurchase(
    data.registryUri.replace('rho:id:', ''),
    PRIVATE_KEY,
    PUBLIC_KEY,
    PURSES_TO_CREATE
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log(
    '✓ 12 try to purchase with insuffiscient REV, fails and is refunded'
  );
  console.log(
    '  12 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );
};

main();
