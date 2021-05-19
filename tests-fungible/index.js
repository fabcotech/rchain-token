const rc = require('rchain-toolkit');
require('dotenv').config();

const getBalance = require('./getBalance').main;
const checkPursesInContract = require('./checkPursesInContract.js').main;
const checkPursePriceInContract = require('./checkPursePriceInContract.js')
  .main;
const checkPurseDataInContract = require('./checkPurseDataInContract.js').main;
const checkPursesInBox = require('./checkPursesInBox.js').main;

const deployBox = require('./test_deployBox').main;
const deploy = require('./test_deploy').main;
const deployMaster = require('./test_deployMaster').main;
const withdraw = require('./test_withdraw').main;
const checkDefaultPurses = require('./test_checkDefaultPurses').main;
const createPurses = require('./test_createPurses.js').main;
const sendPurse = require('./test_sendPurse.js').main;
const splitPurse = require('./test_splitPurse.js').main;
const setPrice = require('./test_setPrice.js').main;
const updatePurseData = require('./test_updatePurseData.js').main;
const checkBagData = require('./test_checkBagData.js').main;
const purchase = require('./test_purchase').main;

const PURSES_TO_CREATE = 10;

const PRIVATE_KEY =
  '28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36';
const PUBLIC_KEY = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY);

const PRIVATE_KEY_2 =
  'a2803d16030f83757a5043e5c0e28573685f6d8bf4e358bf1385d82bffa8e698';
const PUBLIC_KEY_2 = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY_2);

const PUBLIC_KEY_3 =
  '0459030bff5123ffa8360fe0c57b97c5d5578bd6da07af17a7879c2081153acea0f0f40c88f1615e763121123cded66844eab6dfeb46892fb095076648c0066274';

const balances1 = [];
const balances2 = [];
const balances3 = [];

const main = async () => {
  balances1.push(await getBalance(PUBLIC_KEY));
  balances2.push(await getBalance(PUBLIC_KEY_2));
  balances3.push(await getBalance(PUBLIC_KEY_3));

  const data = await deployMaster(
    PRIVATE_KEY,
    PUBLIC_KEY,
  );
  const masterRegistryUri = data.registryUri.replace('rho:id:', '');
  console.log('  masterRegistryUri', masterRegistryUri);

  const contractRegistryUri = data.registryUri.replace('rho:id:', '');
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 01 deploy master');
  console.log(
    '  01 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  const dataBox = await deployBox(PRIVATE_KEY, PUBLIC_KEY, masterRegistryUri, "box1");
  balances1.push(await getBalance(PUBLIC_KEY));

  const secondDataBox = await deployBox(PRIVATE_KEY_2, PUBLIC_KEY_2, masterRegistryUri, "box2");
  balances2.push(await getBalance(PUBLIC_KEY_2));

  console.log('✓ 02 deploy boxes');
  console.log(
    '  02 dust cost (1 box): ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await checkDefaultPurses(masterRegistryUri, "box1");
  await checkDefaultPurses(masterRegistryUri, "box2");
  console.log('✓ 02 check initial purses in boxes');

  const deployData = await deploy(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    "box1",
    true,
    'mytoken',
    // 2% fee
    // 2.000 is 2% of 100.000
    [PUBLIC_KEY_3, 2000],
    2
  );
  // If you purchase a token at 100 REV
  // seller gets 98 REV
  // owner of the contract gets 2 REV

  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 03 deployed fungible/FT contract');
  console.log(
    '  03 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  const t = new Date().getTime();
  await createPurses(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    "mytoken",
    "box1",
    PURSES_TO_CREATE
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log(`✓ 04 create ${PURSES_TO_CREATE} purses`);
  console.log(
    '  04 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );
  console.log(
    `  04 avg time of deploy+propose : ` +
      (new Date().getTime() - t) / 1000 +
      's'
  );

  await checkPursesInBox(masterRegistryUri,"box1", "mytoken", `1`);
  await checkPursesInContract(
    masterRegistryUri,
    1,
    `1`,
    3 * PURSES_TO_CREATE
  );
  console.log(
    `✓ 04 check the presence of 1 purse with quantity: ${
      PURSES_TO_CREATE * 3
    } and right id`
  );

  // split 5 in box 1
  await splitPurse(
    contractRegistryUri,
    PRIVATE_KEY,
    PUBLIC_KEY,
    boxRegistryUri,
    5,
    `4` // ID of the purse to split from
  );

  console.log(`✓ 05 split purse`);
  await checkPursesInBox(boxRegistryUri, contractRegistryUri, `4`);
  await checkPursesInContract(
    contractRegistryUri,
    2,
    `4`,
    PURSES_TO_CREATE * 3 - 5
  );
  await checkPursesInContract(
    contractRegistryUri,
    2,
    `${PURSES_TO_CREATE + 2}`,
    5
  );
  console.log(
    `✓ 05 check the presence of 2 purses with the right amounts and ids`
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log(
    '  05 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );
  // send from box 1 to box 2
  await sendPurse(
    contractRegistryUri,
    PRIVATE_KEY,
    PUBLIC_KEY,
    boxRegistryUri,
    secondBoxRegistryUri,
    '' + (PURSES_TO_CREATE + 2) // ID of the purse to send
  );

  await checkPursesInContract(
    contractRegistryUri,
    2,
    `${PURSES_TO_CREATE + 3}`,
    5
  );
  await checkPursesInBox(boxRegistryUri, contractRegistryUri, `4`);

  balances1.push(await getBalance(PUBLIC_KEY));
  console.log(`✓ 06 send one purse (5 tokens) from box 1 to box 2`);
  console.log(
    '  06 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  // send from box 2 to box 1
  await sendPurse(
    contractRegistryUri,
    PRIVATE_KEY_2,
    PUBLIC_KEY_2,
    secondBoxRegistryUri,
    boxRegistryUri,
    '' + (PURSES_TO_CREATE + 3) // ID of the purse to send
  );
  await checkPursesInContract(contractRegistryUri, 1, `4`, 30);
  await checkPursesInBox(boxRegistryUri, contractRegistryUri, `4`);
  await checkPursesInBox(secondBoxRegistryUri, contractRegistryUri, 'none');
  balances2.push(await getBalance(PUBLIC_KEY_2));
  console.log(`✓ 07 send one purse (5 tokens) from box 2 to box 1`);
  console.log(
    '  07 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );

  await withdraw(contractRegistryUri, PUBLIC_KEY, PRIVATE_KEY, {
    purseId: `4`,
    fromBoxRegistryUri: boxRegistryUri,
    toBoxRegistryUri: secondBoxRegistryUri,
    quantityToWithdraw: 6,
  });
  balances1.push(await getBalance(PUBLIC_KEY));
  await checkPursesInBox(
    secondBoxRegistryUri,
    contractRegistryUri,
    `${PURSES_TO_CREATE + 5}`
  );
  await checkPursesInBox(boxRegistryUri, contractRegistryUri, `4`);
  await checkPursesInContract(
    contractRegistryUri,
    2,
    `4`,
    PURSES_TO_CREATE * 3 - 6
  );
  await checkPursesInContract(
    contractRegistryUri,
    2,
    `${PURSES_TO_CREATE + 5}`,
    6
  );
  console.log(`✓ 08 withdraw 6 from box 1 to box 2`);
  console.log(
    '  08 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await updatePurseData(
    contractRegistryUri,
    PRIVATE_KEY,
    PUBLIC_KEY,
    boxRegistryUri,
    `4`, // bag 4 that probably has not been sent
    'aaa'
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  await checkPurseDataInContract(contractRegistryUri, `4`, 'aaa');

  console.log(`✓ 09 update data associated to purse`);
  console.log(
    '  09 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await setPrice(
    contractRegistryUri,
    PRIVATE_KEY,
    PUBLIC_KEY,
    boxRegistryUri,
    1000,
    `4` // ID of the purse to set a price to
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  await checkPursePriceInContract(contractRegistryUri, `4`, 1000);
  console.log(`✓ 10 set a price to a purse`);
  console.log(
    '  10 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );
  const balance1BeforePurchase = balances1[balances1.length - 1];
  const purchaseFailed1 = await purchase(
    contractRegistryUri,
    PRIVATE_KEY_2,
    PUBLIC_KEY_2,
    {
      toBoxRegistryUri: secondBoxRegistryUri,
      purseId: `4`,
      quantity: 'Nil', // invalid payload
      data: 'bbb',
      newId: null,
      price: 1000,
      publicKey: PUBLIC_KEY_2,
    }
  );
  balances1.push(await getBalance(PUBLIC_KEY_2));
  if (
    purchaseFailed1.status !== 'failed' ||
    purchaseFailed1.message !==
      'error: invalid payload, cancelled purchase and payment'
  ) {
    throw new Error('purchase should have fail with proper error message (1)');
  }
  console.log(`✓ 11 failed purchase because of invalid payload`);

  const purchaseFailed2 = await purchase(
    contractRegistryUri,
    PRIVATE_KEY_2,
    PUBLIC_KEY_2,
    {
      toBoxRegistryUri: secondBoxRegistryUri,
      purseId: `4`,
      quantity: 50, // invalid payload
      data: 'bbb',
      newId: null,
      price: 1000,
      publicKey: PUBLIC_KEY_2,
    }
  );
  balances1.push(await getBalance(PUBLIC_KEY_2));
  console.log(`✓ 12 failed purchase because of invalid quantity`);
  if (
    purchaseFailed2.status !== 'failed' ||
    purchaseFailed2.message !==
      'error: quantity not available or purse not for sale, issuer was refunded'
  ) {
    throw new Error('purchase should have fail with proper error message (2)');
  }
  const purchaseSuccess = await purchase(
    contractRegistryUri,
    PRIVATE_KEY_2,
    PUBLIC_KEY_2,
    {
      toBoxRegistryUri: secondBoxRegistryUri,
      purseId: `4`,
      quantity: 1,
      data: 'bbb',
      newId: null,
      price: 1000,
      publicKey: PUBLIC_KEY_2,
    }
  );
  if (purchaseSuccess.status !== 'completed') {
    throw new Error('purchase should have been successful');
  }
  await checkPursesInBox(
    secondBoxRegistryUri,
    contractRegistryUri,
    `${PURSES_TO_CREATE + 5}`
  );
  await checkPursesInContract(
    contractRegistryUri,
    2,
    `4`,
    PURSES_TO_CREATE * 3 - 7
  );
  await checkPursesInContract(
    contractRegistryUri,
    2,
    `${PURSES_TO_CREATE + 5}`,
    6 + 1
  );
  const balance1AfterPurchase = await getBalance(PUBLIC_KEY);
  if (balance1BeforePurchase + 980 !== balance1AfterPurchase) {
    throw new Error('owner of box 1 did not receive payment from purchase');
  }

  const balance3AfterPurchase = await getBalance(PUBLIC_KEY_3);
  if (balances3[0] + 20 !== balance3AfterPurchase) {
    throw new Error('owner of public key 3 did not receive fee from purchase');
  }
  console.log(`✓ 13 purchase`);
  console.log(`✓ 13 balance of purse's owner checked and has +10 dust`);
  console.log(`✓ 13 2% fee was earned by owner of public key 3`);

  balances1.push(await getBalance(PUBLIC_KEY_2));
  console.log(
    '  13 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );
};

main();
