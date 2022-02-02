const rc = require('rchain-toolkit');
require('dotenv').config();

const checkPursesInContractFT = require('../tests-ft/checkPursesInContract.js').main;
const getBalance = require('../tests-ft/getBalance').main;
const deployBox = require('../tests-ft/test_deployBox').main;
const deployMaster = require('../tests-ft/test_deployMaster').main;
const withdraw = require('../tests-ft/test_withdraw').main;
const checkDefaultPurses = require('../tests-ft/test_checkDefaultPurses').main;
const credit = require('../tests-ft/test_credit').main;

const PRIVATE_KEY = '28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36';
const PUBLIC_KEY = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY);

const PRIVATE_KEY_2 = 'a2803d16030f83757a5043e5c0e28573685f6d8bf4e358bf1385d82bffa8e698';
const PUBLIC_KEY_2 = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY_2);

const balances1 = [];
const balances2 = [];

const main = async () => {
  balances1.push(await getBalance(PUBLIC_KEY));
  balances2.push(await getBalance(PUBLIC_KEY_2));
  console.log(`  balances (dust) : (1) ${balances1[0]}, (2) ${balances2[0]}`)

  let boxId1 = "box1";
  let boxId2 = "box2";
  let contractId = "mytoken";
  let prefix = '';

  const data = await deployMaster(PRIVATE_KEY, PUBLIC_KEY);
  const masterRegistryUri = data.registryUri.replace('rho:id:', '');
  prefix = masterRegistryUri.slice(0, 3);

  const contractRegistryUri = data.registryUri.replace('rho:id:', '');
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 01 deploy master');
  console.log(
    '  01 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

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

  console.log('✓ 02 deploy boxes');
  console.log(
    '  02 dust cost (1 box): ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await checkDefaultPurses(masterRegistryUri, boxId1);
  await checkDefaultPurses(masterRegistryUri, boxId2);
  console.log('✓ 02 check initial purses in boxes');

  const balanceBeforeCredit1 = await getBalance(PUBLIC_KEY);
  const creditResult = await credit(
    PRIVATE_KEY,
    {
      revAddress: rc.utils.revAddressFromPublicKey(PUBLIC_KEY),
      quantity: 1000000000,
      masterRegistryUri: masterRegistryUri,
      boxId: boxId1
    }
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  if (creditResult.status !== "completed") {
    console.log(creditResult);
    throw new Error('credit should have worked')
  }

  const balanceAfterCredit1 = await getBalance(PUBLIC_KEY);
  if (balanceBeforeCredit1 - balanceAfterCredit1 < 100000000) {
    console.log('balanceBeforeCredit1', balanceBeforeCredit1);
    console.log('balanceAfterCredit1', balanceAfterCredit1);
    throw new Error('credit was not successful apparently (rev balance)')
  }

  await checkPursesInContractFT(
    masterRegistryUri,
    `${prefix}rev`,
    1,
    `1`,
    1000000000
  );

  console.log(`✓ 03 credited 10 REV, balance before : ${Math.round(balanceBeforeCredit1 / 100000000)} REV, balance after: ${Math.round(balanceAfterCredit1 / 100000000)} REV`);

  await withdraw(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    boxId2,
    `${prefix}rev`,
    200000000,
    "1" // id of the purse to withdraw from
  );

  await checkPursesInContractFT(
    masterRegistryUri,
    `${prefix}rev`,
    2,
    `1`,
    1000000000 - 200000000
  );

  await checkPursesInContractFT(
    masterRegistryUri,
    `${prefix}rev`,
    2,
    `2`,
    200000000
  );

  console.log('✓ 04 withdraw 2 wrapped REV to box2, balances (wrapped rev) ok');

  const balanceBeforeCreditBack = await getBalance(PUBLIC_KEY);
  await withdraw(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    "_rev",
    `${prefix}rev`,
    200000000,
    "1" // id of the purse to withdraw from
  );

  const balanceAfterCreditBack = await getBalance(PUBLIC_KEY);
  if (balanceAfterCreditBack < balanceBeforeCreditBack) {
    console.log('balanceBeforeCreditBack', balanceBeforeCreditBack);
    console.log('balanceAfterCreditBack', balanceAfterCreditBack);
    throw new Error('credit was not successful apparently (rev balance)')
  }

  console.log('✓ 05 box1 credited back 2 REV successful, earned ' +  Math.round((balanceAfterCreditBack - balanceBeforeCreditBack) / 100000000) + " true REV");

  await checkPursesInContractFT(
    masterRegistryUri,
    `${prefix}rev`,
    2,
    `1`,
    1000000000 - 200000000 - 200000000
  );

  console.log('✓ 06 balance of wrapped REV correct after credit back');

  const balanceBeforeCreditBack2 = await getBalance(PUBLIC_KEY_2);
  await withdraw(
    PRIVATE_KEY_2,
    PUBLIC_KEY_2,
    masterRegistryUri,
    boxId2,
    "_rev",
    `${prefix}rev`,
    200000000,
    "2" // id of the purse to withdraw from
  );
  const balanceAfterCreditBack2 = await getBalance(PUBLIC_KEY_2);
  if (balanceAfterCreditBack2 < balanceBeforeCreditBack2) {
    console.log('balanceBeforeCreditBack2', balanceBeforeCreditBack2);
    console.log('balanceAfterCreditBack2', balanceAfterCreditBack2);
    throw new Error('credit was not successful apparently (rev balance)')
  }

  console.log('✓ 07 box2 credited back 2 REV successful, earned ' +  Math.round((balanceAfterCreditBack2 - balanceBeforeCreditBack2) / 100000000) + " true REV");
};

main();
