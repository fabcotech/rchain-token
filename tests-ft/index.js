const rc = require('@fabcotech/rchain-toolkit');
require('dotenv').config();

const getAllData = require('./getAllData').main;
const getAllBoxData = require('./getAllBoxData').main;
const fillBalances = require('./fillBalances').main;
const getBalance = require('./getBalance').main;
const checkFee = require('./checkFee').main;
const checkPursesInContract = require('./checkPursesInContract.js').main;
const checkPursePriceInContract =
  require('./checkPursePriceInContract.js').main;
const checkPurseDataInContract = require('./checkPurseDataInContract.js').main;
const checkPursesInBox = require('./checkPursesInBox.js').main;
const deployBox = require('./test_deployBox').main;
const deploy = require('./test_deploy').main;
const updateFee = require('./test_updateFee').main;
const deployMaster = require('./test_deployMaster').main;
const withdraw = require('./test_withdraw').main;
const checkDefaultPurses = require('./test_checkDefaultPurses').main;
const createPurses = require('./test_createPurses.js').main;
const updatePurseData = require('./test_updatePurseData.js').main;
const updatePursePrice = require('./test_updatePursePrice.js').main;
const swap = require('./test_swap').main;
const credit = require('./test_credit').main;

const WRAPPED_REV_QUANTITY = 100 * 100000000;
const PURSES_TO_CREATE = 10;

const PRIVATE_KEY =
  '28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36';
const PUBLIC_KEY = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY);

const PRIVATE_KEY_2 =
  'a2803d16030f83757a5043e5c0e28573685f6d8bf4e358bf1385d82bffa8e698';
const PUBLIC_KEY_2 = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY_2);

const PRIVATE_KEY_3 = "62dce7c35de80ba4bbdebc2653d3ca4d7b46454a7b7a992ef36593f5a0c81b31"
const PUBLIC_KEY_3 = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY_3);

const balances1 = [];
const balances2 = [];
const balances3 = [];

const main = async () => {
  await fillBalances(PRIVATE_KEY, PUBLIC_KEY, PUBLIC_KEY_2, PUBLIC_KEY_3);
  balances1.push(await getBalance(PUBLIC_KEY));
  balances2.push(await getBalance(PUBLIC_KEY_2));
  balances3.push(await getBalance(PUBLIC_KEY_3));
  console.log(`  balances (dust) : (1) ${balances1[0]}, (2) ${balances2[0]}, (3) ${balances3[0]}`)

  let prefix = "";
  let boxId1 = "box1";
  let boxId2 = "box2";
  let boxId3 = "box3";
  let contractId = "mytoken";
  const data = await deployMaster(PRIVATE_KEY, PUBLIC_KEY);
  const masterRegistryUri = data.registryUri.replace('rho:id:', '');
  prefix = masterRegistryUri.slice(0, 3);

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
  console.log('✓ 02 failed to deploy invalid box');

  await deployBox(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  boxId1 = `${prefix}${boxId1}`
  console.log('  Box 1 with prefix : ' + boxId1)

  await deployBox(
    PRIVATE_KEY_2,
    PUBLIC_KEY_2,
    masterRegistryUri,
    boxId2
  );
  balances2.push(await getBalance(PUBLIC_KEY_2));
  boxId2 = `${prefix}${boxId2}`
  console.log('  Box 2 with prefix : ' + boxId2)

  await deployBox(
    PRIVATE_KEY_3,
    PUBLIC_KEY_3,
    masterRegistryUri,
    boxId3
  );
  balances3.push(await getBalance(PUBLIC_KEY_3));
  boxId3 = `${prefix}${boxId3}`;
  console.log('  Box 3 with prefix : ' + boxId3)

  console.log('✓ 02 deploy boxes');
  console.log(
    '  02 dust cost (1 box): ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await checkDefaultPurses(masterRegistryUri, boxId1);
  await checkDefaultPurses(masterRegistryUri, boxId2);
  console.log('✓ 02 check initial purses in boxes');

  const creditResult = await credit(
    PRIVATE_KEY,
    {
      revAddress: rc.utils.revAddressFromPublicKey(PUBLIC_KEY),
      quantity: WRAPPED_REV_QUANTITY,
      masterRegistryUri: masterRegistryUri,
      boxId: boxId1
    }
  );
  if (creditResult.status !== "completed") {
    console.log(creditResult);
    throw new Error('credit should have worked')
  }
  console.log('✓ 02.1 credit box1 in [prefix]rev');

  const deployData = await deploy(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    true,
    contractId,
    // expiration always null for FT
    null
  );
  // If you purchase a token at 100 REV
  // seller gets 98 REV
  // owner of the contract gets 2 REV

  contractId = `${prefix}${contractId}`
  console.log('  Contact ID with prefix : ' + contractId)
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 03 deployed fungible/FT contract');
  console.log(
    '  03 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await checkFee(masterRegistryUri, contractId, null);
  const updateFee1 = await updateFee(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    contractId,
    // 2% fee
    // 2.000 is 2% of 100.000
    [boxId3, 2000],
  );
  await checkFee(masterRegistryUri, contractId, [boxId3, 2000]);

  console.log(`✓ 04 updated and checked fees multiple times`);

  const createdPursesFailed = await createPurses(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    contractId,
    'boxdoesnotexist',
    1,
    3
  );
  if (
    createdPursesFailed.results['0'] !== 'error: invalid id or box not found'
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
    [`"${prefix}rev"`, 1000]
  );

  balances2.push(await getBalance(PUBLIC_KEY_2));
  await checkPursePriceInContract(
    masterRegistryUri,
    contractId,
    `${PURSES_TO_CREATE + 1}`,
    [`${prefix}rev`, 1000]
  );
  console.log(`✓ 09 set a price to a purse`);
  console.log(
    '  09 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );

  const swapFailed1 = await swap(PRIVATE_KEY, {
    masterRegistryUri: masterRegistryUri,
    purseId: `${PURSES_TO_CREATE + 1}`,
    contractId: contractId,
    boxId: boxId1,
    quantity: 'Nil', // invalid payload
    newId: 'none',
    merge: true,
  });
  balances1.push(await getBalance(PUBLIC_KEY));
  if (
    swapFailed1.status !== 'failed' ||
    swapFailed1.message !==
      'error: invalid payload'
  ) {
    console.log(swapFailed1);
    throw new Error(
      'swap should have failed with proper error message (1)'
    );
  }
  console.log(`✓ 10 failed swap because of invalid payload`);

  const swapFailed2 = await swap(PRIVATE_KEY, {
    masterRegistryUri: masterRegistryUri,
    purseId: `${PURSES_TO_CREATE + 1}`,
    contractId: contractId,
    boxId: boxId1,
    quantity: PURSES_TO_CREATE * 3 + 1, // not available
    newId: 'none',
    merge: true,
  });
  if (
    swapFailed2.status !== 'failed' ||
    swapFailed2.message !== `error: quantity not available`
  ) {
    console.log(swapFailed2);
    throw new Error(
      'swap should have failed with proper error message (2)'
    );
  }
  console.log(`✓ 11 failed swap because of invalid quantity`);

  const swapSuccess = await swap(PRIVATE_KEY, {
    masterRegistryUri: masterRegistryUri,
    purseId: `${PURSES_TO_CREATE + 1}`,
    contractId: contractId,
    boxId: boxId1,
    quantity: 1,
    newId: 'none',
    merge: true,
  });
  balances1.push(await getBalance(PUBLIC_KEY));
  balances3.push(await getBalance(PUBLIC_KEY_3));
  if (swapSuccess.status !== 'completed') {
    console.log(swapSuccess)
    throw new Error('swap should have been successful');
  }

  // mytoken checks
  await checkPurseDataInContract(
    masterRegistryUri,
    contractId,
    `${PURSES_TO_CREATE + 3}`,
    'aaa'
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

  // rev checks
  await checkPursesInBox(
    masterRegistryUri,
    boxId1,
    `${prefix}rev`,
    `1`
  );
  await checkPursesInBox(
    masterRegistryUri,
    boxId2,
    `${prefix}rev`,
    `2`
  );
  await checkPursesInBox(
    masterRegistryUri,
    boxId3,
    `${prefix}rev`,
    `3`
  );
  await checkPursesInContract(
    masterRegistryUri,
    `${prefix}rev`,
    3,
    `2`,
    980
  );
  await checkPursesInContract(
    masterRegistryUri,
    `${prefix}rev`,
    3,
    `3`,
    20
  );
  await checkPursesInContract(
    masterRegistryUri,
    `${prefix}rev`,
    3,
    `1`,
    WRAPPED_REV_QUANTITY - 1000
  );

  console.log(`✓ 12 swap successful`);
  console.log(`✓ 12 balance of purse's owner checked and has +980 [prefix]rev`);
  console.log(`✓ 12 2% fee of [prefix]rev was earned by owner of box 3`);
  console.log(
    '  12 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  // 1 (= total) out of box 1
  await withdraw(
    PRIVATE_KEY,
    masterRegistryUri,
    boxId1,
    "_burn",
    contractId,
    1,
    `${PURSES_TO_CREATE + 3}`
  );
  await checkPursesInContract(
    masterRegistryUri,
    contractId,
    2,
    `${PURSES_TO_CREATE + 4}`,
    1
  );
  await checkPursesInContract(
    masterRegistryUri,
    contractId,
    2,
    `${PURSES_TO_CREATE + 1}`,
    (PURSES_TO_CREATE * 3) - 1
  );
  await checkPursesInBox(
    masterRegistryUri,
    boxId2,
    contractId,
    `${PURSES_TO_CREATE + 1}`
  );
  console.log(`✓ 13 burned 1 token (total) that was in box 1's purse`);
};

main();
