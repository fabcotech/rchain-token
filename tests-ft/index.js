const rc = require('rchain-toolkit');
require('dotenv').config();

const fillBalances = require('./fillBalances').main;
const getBalance = require('./getBalance').main;
const checkFee = require('./checkFee').main;
const checkPursesInContract = require('./checkPursesInContract.js').main;
const checkPursePriceInContract =
  require('./checkPursePriceInContract.js').main;
const checkPurseDataInContract = require('./checkPurseDataInContract.js').main;
const checkPursesInBox = require('./checkPursesInBox.js').main;
const checkLogsInContract = require('./checkLogsInContract').main;

const deployBox = require('./test_deployBox').main;
const deploy = require('./test_deploy').main;
const updateFee = require('./test_updateFee').main;
const deployMaster = require('./test_deployMaster').main;
const withdraw = require('./test_withdraw').main;
const checkDefaultPurses = require('./test_checkDefaultPurses').main;
const createPurses = require('./test_createPurses.js').main;
const updatePurseData = require('./test_updatePurseData.js').main;
const updatePursePrice = require('./test_updatePursePrice.js').main;
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
  fillBalances(PRIVATE_KEY, PUBLIC_KEY, PUBLIC_KEY_2, PUBLIC_KEY_3);
  balances1.push(await getBalance(PUBLIC_KEY));
  balances2.push(await getBalance(PUBLIC_KEY_2));
  balances3.push(await getBalance(PUBLIC_KEY_3));

  let boxId1 = "box1";
  let boxId2 = "box2";
  let contractId = "mytoken";
  const data = await deployMaster(PRIVATE_KEY, PUBLIC_KEY);
  const masterRegistryUri = data.registryUri.replace('rho:id:', '');

  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 01 deploy master');
  console.log(
    '  01 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  let boxFailed = false;
  try {
    const dataBoxFailed = await deployBox(
      PRIVATE_KEY,
      PUBLIC_KEY,
      masterRegistryUri,
      'box,'
    );
  } catch (e) {
    boxFailed = true;
  }
  if (boxFailed == false) {
    throw new Error('Box deploy with invalid character should have failed');
  }

  const dataBox = await deployBox(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  boxId1 = `${masterRegistryUri.slice(0,3)}${boxId1}`
  console.log('  Box 1 with prefix : ' + boxId1)

  const secondDataBox = await deployBox(
    PRIVATE_KEY_2,
    PUBLIC_KEY_2,
    masterRegistryUri,
    boxId2
  );
  balances2.push(await getBalance(PUBLIC_KEY_2));

  boxId2 = `${masterRegistryUri.slice(0,3)}${boxId2}`
  console.log('  Box 2 with prefix : ' + boxId2)

  console.log('✓ 02 deploy boxes');
  console.log(
    '  02 dust cost (1 box): ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await checkDefaultPurses(masterRegistryUri, boxId1);
  await checkDefaultPurses(masterRegistryUri, boxId2);
  console.log('✓ 02 check initial purses in boxes');

  const deployData = await deploy(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    true,
    contractId,
    // 2% fee
    // 2.000 is 2% of 100.000
    [PUBLIC_KEY_3, 2000],
    // expiration always null for FT
    null
  );
  // If you purchase a token at 100 REV
  // seller gets 98 REV
  // owner of the contract gets 2 REV

  contractId = `${masterRegistryUri.slice(0,3)}${contractId}`
  console.log('  Contact ID with prefix : ' + contractId)
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 03 deployed fungible/FT contract');
  console.log(
    '  03 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  console.log('checkFee');
  await checkFee(masterRegistryUri, contractId, [PUBLIC_KEY_3, 2000]);
  const updateFee1 = await updateFee(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    contractId,
    null,
  );
  await checkFee(masterRegistryUri, contractId, null);
  const updateFee2 = await updateFee(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    contractId,
    [PUBLIC_KEY_3, 2000],
  );
  await checkFee(masterRegistryUri, contractId, [PUBLIC_KEY_3, 2000]);

  console.log(`✓ 04 updated and checked fees multiple times`);

  const createdPursesFailed = await createPurses(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    contractId,
    'boxdoesnotexist',
    1
  );
  if (
    createdPursesFailed.results['0'] !== 'error: box not found boxdoesnotexist'
  ) {
    throw new Error(
      'CREATE_PURSE should have failed because of non-existent box'
    );
  }

  const t = new Date().getTime();
  await createPurses(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    contractId,
    boxId1,
    PURSES_TO_CREATE
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log(`✓ 05 create ${PURSES_TO_CREATE} purses`);
  console.log(
    '  05 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );
  console.log(
    `  05 avg time of deploy+propose : ` +
      (new Date().getTime() - t) / 1000 +
      's'
  );

  await checkPursesInBox(masterRegistryUri, boxId1, contractId, `1`);
  await checkPursesInContract(
    masterRegistryUri,
    contractId,
    1,
    `1`,
    3 * PURSES_TO_CREATE
  );
  console.log(
    `✓ 05 check the presence of 1 purse with quantity: ${
      PURSES_TO_CREATE * 3
    } and right id`
  );

  await withdraw(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    boxId2,
    contractId,
    5,
    `1` // id of the purse to withdraw from
  );

  console.log(`✓ 06 withdraw`);
  await checkPursesInBox(
    masterRegistryUri,
    boxId2,
    contractId,
    `${PURSES_TO_CREATE + 1}`
  );
  await checkPursesInContract(
    masterRegistryUri,
    contractId,
    2,
    `1`,
    PURSES_TO_CREATE * 3 - 5
  );
  await checkPursesInContract(
    masterRegistryUri,
    contractId,
    2,
    `${PURSES_TO_CREATE + 1}`,
    5
  );
  console.log(
    `✓ 06 check the presence of 2 purses with the right amounts and ids`
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log(
    '  06 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await withdraw(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    boxId2,
    contractId,
    PURSES_TO_CREATE * 3 - 5, // everything remaining
    `1` // id of the purse to withdraw from
  );

  await checkPursesInBox(masterRegistryUri, boxId1, contractId, `none`);
  await checkPursesInBox(
    masterRegistryUri,
    boxId2,
    contractId,
    `${PURSES_TO_CREATE + 1}`
  );
  await checkPursesInContract(
    masterRegistryUri,
    contractId,
    1,
    `${PURSES_TO_CREATE + 1}`,
    PURSES_TO_CREATE * 3
  );

  balances1.push(await getBalance(PUBLIC_KEY));
  console.log(
    `✓ 07 withdraw/send one entire purse (25 tokens) from box 1 to box 2, initial purse deleted`
  );
  console.log(
    '  07 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await updatePurseData(
    PRIVATE_KEY_2,
    PUBLIC_KEY_2,
    masterRegistryUri,
    boxId2,
    contractId,
    `${PURSES_TO_CREATE + 1}`,
    'aaa'
  );
  balances2.push(await getBalance(PUBLIC_KEY_2));
  await checkPurseDataInContract(
    masterRegistryUri,
    contractId,
    `${PURSES_TO_CREATE + 1}`,
    'aaa'
  );

  console.log(`✓ 08 update data associated to purse`);
  console.log(
    '  08 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );

  await updatePursePrice(
    PRIVATE_KEY_2,
    PUBLIC_KEY_2,
    masterRegistryUri,
    boxId2,
    contractId,
    `${PURSES_TO_CREATE + 1}`,
    1000
  );

  balances2.push(await getBalance(PUBLIC_KEY_2));
  await checkPursePriceInContract(
    masterRegistryUri,
    contractId,
    `${PURSES_TO_CREATE + 1}`,
    1000
  );
  console.log(`✓ 09 set a price to a purse`);
  console.log(
    '  09 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );

  const balance2BeforePurchase = balances2[balances2.length - 1];
  const purchaseFailed1 = await purchase(PRIVATE_KEY, PUBLIC_KEY, {
    masterRegistryUri: masterRegistryUri,
    purseId: `${PURSES_TO_CREATE + 1}`,
    contractId: contractId,
    boxId: boxId1,
    quantity: 'Nil', // invalid payload
    data: 'bbb',
    newId: '',
    merge: true,
    price: 1000,
    publicKey: PUBLIC_KEY,
  });
  balances1.push(await getBalance(PUBLIC_KEY));
  if (
    purchaseFailed1.status !== 'failed' ||
    purchaseFailed1.message !==
      'error: invalid payload, cancelled purchase and payment'
  ) {
    console.log(purchaseFailed1);
    throw new Error(
      'purchase should have failed with proper error message (1)'
    );
  }
  console.log(`✓ 10 failed purchase because of invalid payload`);

  const purchaseFailed2 = await purchase(PRIVATE_KEY, PUBLIC_KEY, {
    masterRegistryUri: masterRegistryUri,
    purseId: `${PURSES_TO_CREATE + 1}`,
    contractId: contractId,
    boxId: boxId1,
    quantity: PURSES_TO_CREATE * 3 + 1, // not available
    data: 'bbb',
    newId: '',
    merge: true,
    price: 1000,
    publicKey: PUBLIC_KEY,
  });
  balances1.push(await getBalance(PUBLIC_KEY));
  if (
    purchaseFailed2.status !== 'failed' ||
    purchaseFailed2.message !==
      `error: purchase failed but was able to refund ${
        1000 * (PURSES_TO_CREATE * 3 + 1)
      } error: quantity not available or purse not for sale`
  ) {
    console.log(purchaseFailed2);
    throw new Error(
      'purchase should have failed with proper error message (2)'
    );
  }
  console.log(`✓ 11 failed purchase because of invalid quantity`);

  const purchaseSuccess = await purchase(PRIVATE_KEY, PUBLIC_KEY, {
    masterRegistryUri: masterRegistryUri,
    purseId: `${PURSES_TO_CREATE + 1}`,
    contractId: contractId,
    boxId: boxId1,
    quantity: 1,
    data: 'bbb',
    newId: null,
    merge: true,
    price: 1000,
    publicKey: PUBLIC_KEY,
  });
  balances1.push(await getBalance(PUBLIC_KEY));
  balances3.push(await getBalance(PUBLIC_KEY_3));
  if (purchaseSuccess.status !== 'completed') {
    throw new Error('purchase should have been successful');
  }

  await checkPurseDataInContract(
    masterRegistryUri,
    contractId,
    `${PURSES_TO_CREATE + 3}`,
    'bbb'
  );
  await checkPursesInBox(
    masterRegistryUri,
    boxId1,
    contractId,
    `${PURSES_TO_CREATE + 3}`
  );
  await checkPursesInContract(
    masterRegistryUri,
    contractId,
    2,
    `${PURSES_TO_CREATE + 3}`,
    1
  );
  await checkPursesInContract(
    masterRegistryUri,
    contractId,
    2,
    `${PURSES_TO_CREATE + 1}`,
    PURSES_TO_CREATE * 3 - 1
  );
  const balance2AfterPurchase = await getBalance(PUBLIC_KEY_2);
  if (balance2BeforePurchase + 980 !== balance2AfterPurchase) {
    throw new Error('owner of box 2 did not receive payment from purchase');
  }

  if (
    balances3[balances3.length - 2] + 20 !==
    balances3[balances3.length - 1]
  ) {
    throw new Error('owner of public key 3 did not receive fee from purchase');
  }
  console.log(`✓ 12 purchase`);
  console.log(`✓ 12 balance of purse's owner checked and has +980 dust`);
  console.log(`✓ 12 2% fee was earned by owner of public key 3`);

  balances1.push(await getBalance(PUBLIC_KEY_2));
  console.log(
    '  12 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );

  await checkLogsInContract(
    masterRegistryUri,
    contractId,
    `p,${boxId2},${boxId1},1,1000,11,13;`
  );
};

main();
