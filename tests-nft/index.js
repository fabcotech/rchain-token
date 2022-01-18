const rc = require('rchain-toolkit');
require('dotenv').config();

const fillBalances = require('../tests-ft/fillBalances').main;
const getAllData = require('../tests-ft/getAllData').main;
const checkPursesInContract = require('./checkPursesInContract.js').main;
const checkPursesSameTimestampInContract =
  require('./checkPursesSameTimestampInContract.js').main;
const createPurses = require('./test_createPurses.js').main;
const deletePurse = require('./test_deletePurse.js').main;
const deleteExpiredPurse = require('./test_deleteExpiredPurse.js').main;
const checkPursesInBox = require('./checkPursesInBox.js').main;
const getRandomName = require('./getRandomName.js').main;
const renew = require('./test_renew.js').main;

const checkLogsInContract = require('../tests-ft/checkLogsInContract').main;
const checkPursePriceInContract =
  require('../tests-ft/checkPursePriceInContract.js').main;
const checkFee = require('../tests-ft/checkFee').main;
const updateFee = require('../tests-ft/test_updateFee').main;
const checkPurseDataInContract =
  require('../tests-ft/checkPurseDataInContract.js').main;
const getBalance = require('../tests-ft/getBalance').main;
const deployBox = require('../tests-ft/test_deployBox').main;
const deploy = require('../tests-ft/test_deploy').main;
const deployMaster = require('../tests-ft/test_deployMaster').main;
const withdraw = require('../tests-ft/test_withdraw').main;
const checkDefaultPurses = require('../tests-ft/test_checkDefaultPurses').main;
const updatePurseData = require('../tests-ft/test_updatePurseData.js').main;
const updatePursePrice = require('../tests-ft/test_updatePursePrice.js').main;
const purchase = require('../tests-ft/test_purchase').main;

const PURSES_TO_CREATE = 10;
// the goal is that step 17 fails multiple time
// and then succeeds
const EXPIRES = 600000;

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
  await fillBalances(PRIVATE_KEY, PUBLIC_KEY, PUBLIC_KEY_2, PUBLIC_KEY_3);
  balances1.push(await getBalance(PUBLIC_KEY));
  balances2.push(await getBalance(PUBLIC_KEY_2));
  balances3.push(await getBalance(PUBLIC_KEY_3));

  let boxId1 = "box1";
  let boxId2 = "box2";
  let contractId = "mytoken";

  const data = await deployMaster(PRIVATE_KEY, PUBLIC_KEY);
  const masterRegistryUri = data.registryUri.replace('rho:id:', '');

  const contractRegistryUri = data.registryUri.replace('rho:id:', '');
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 01 deploy master');
  console.log(
    '  01 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

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
  console.log('  Box 1 with prefix : ' + boxId2)

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
    false,
    contractId,
    EXPIRES
  );
  contractId = `${masterRegistryUri.slice(0,3)}${contractId}`
  console.log('  Contract ID with prefix : ' + contractId)

  await checkFee(masterRegistryUri, contractId, null);
  // If you purchase a token at 100 REV
  // seller gets 98 REV
  // owner of the contract gets 2 REV
  const updateFee1 = await updateFee(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    contractId,
    // 2% fee
    // 2.000 is 2% of 100.000
    [rc.utils.revAddressFromPublicKey(PUBLIC_KEY_3), 2000],
  );
  console.log(updateFee1);
  await checkFee(masterRegistryUri, contractId, [rc.utils.revAddressFromPublicKey(PUBLIC_KEY_3), 2000]);

  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 03 deployed fungible/FT contract');
  console.log(
    '  03 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  const createdPursesFailed = await createPurses(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    contractId,
    boxId1,
    'boxdoesnotexist',
    ['aaa']
  );
  if (
    createdPursesFailed.results['aaa'] !==
    'error: box not found boxdoesnotexist'
  ) {
    throw new Error(
      'CREATE_PURSE should have failed because of non-existent box'
    );
  }

  const t = new Date().getTime();
  let ids = [];
  for (let i = 0; i < PURSES_TO_CREATE; i += 1) {
    ids.push(getRandomName());
  }
  ids.push('willbedeleted');

  await createPurses(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    contractId,
    boxId1,
    boxId1,
    ids
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

  await checkPursesInBox(masterRegistryUri, boxId1, contractId, [ids[0]]);
  await checkPursesInContract(masterRegistryUri, contractId, ['0'].concat(ids));
  console.log(`✓ 04 check the presence of ${ids.length} purses with quantity`);

  let purseDeleted = await deletePurse(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    contractId,
    boxId1,
    'willbedeleted'
  );
  if (purseDeleted.status !== 'completed') {
    throw new Error('04.1 Failed to delete purse');
  }
  ids = ids.filter((id) => id !== 'willbedeleted');
  await checkPursesInContract(masterRegistryUri, contractId, ['0'].concat(ids));
  console.log(`✓ 04.1 check the that purse has been deleted`);

  await withdraw(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    boxId2,
    contractId,
    1,
    ids[0] // id of the purse to withdraw from
  );

  console.log(`✓ 05 withdraw`);
  await checkPursesInBox(
    masterRegistryUri,
    boxId1,
    contractId,
    ids.filter((id) => id !== ids[0])
  );
  await checkPursesInBox(masterRegistryUri, boxId2, contractId, [ids[0]]);
  await checkPursesInContract(masterRegistryUri, contractId, ids);

  console.log(`✓ 05 check the presence of 1 nft purses in ${boxId2}`);
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log(
    '  05 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await updatePurseData(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    contractId,
    '0',
    'aaa'
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  await checkPurseDataInContract(masterRegistryUri, contractId, '0', 'aaa');

  console.log(`✓ 07 update data associated to purse`);
  console.log(
    '  07 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await updatePursePrice(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    contractId,
    '0',
    1000
  );

  balances1.push(await getBalance(PUBLIC_KEY));
  await checkPursePriceInContract(masterRegistryUri, contractId, '0', 1000);
  console.log(`✓ 08 set a price to purse "0"`);
  console.log(
    '  08 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await updatePursePrice(
    PRIVATE_KEY_2,
    PUBLIC_KEY_2,
    masterRegistryUri,
    boxId2,
    contractId,
    ids[0],
    1000
  );

  balances2.push(await getBalance(PUBLIC_KEY_2));
  await checkPursePriceInContract(masterRegistryUri, contractId, ids[0], 1000);
  console.log(`✓ 09 set a price to a purse`);
  console.log(
    '  09 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );

  const balance2BeforePurchase = balances2[balances2.length - 1];
  const purchaseFailed1 = await purchase(PRIVATE_KEY, PUBLIC_KEY, {
    masterRegistryUri: masterRegistryUri,
    purseId: ids[0],
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
    purseId: ids[0],
    contractId: contractId,
    boxId: boxId1,
    quantity: 2, // not available
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
        1000 * 2
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
    purseId: ids[0],
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
  balances2.push(await getBalance(PUBLIC_KEY_2));
  balances3.push(await getBalance(PUBLIC_KEY_3));
  if (purchaseSuccess.status !== 'completed') {
    throw new Error('purchase should have been successful');
  }
  await checkPursesInBox(
    masterRegistryUri,
    boxId1,
    contractId,
    ['0'].concat(ids)
  );
  await checkPursesInBox(masterRegistryUri, boxId2, contractId, []);
  await checkPursesInContract(masterRegistryUri, contractId, ids);
  await checkPursesSameTimestampInContract(masterRegistryUri, contractId, [
    ids[0],
    ids[1],
  ]);

  if (
    balances2[balances2.length - 2] + 980 !==
    balances2[balances2.length - 1]
  ) {
    throw new Error('owner of box 1 did not receive payment from purchase');
  }

  if (balances3[0] + 20 !== balances3[1]) {
    throw new Error('owner of public key 3 did not receive fee from purchase');
  }
  console.log(`✓ 12 purchase`);
  console.log(`✓ 12 balance of purse's owner checked and has +980 dust`);
  console.log(`✓ 12 2% fee was earned by owner of public key 3`);

  console.log(
    '  12 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  const purchaseFromZeroFailed1 = await purchase(PRIVATE_KEY_2, PUBLIC_KEY_2, {
    masterRegistryUri: masterRegistryUri,
    purseId: '0',
    contractId: contractId,
    boxId: boxId2,
    quantity: 1,
    data: 'bbb',
    newId: 'mytokemytokennmytokenmytokemytokennmytokenmytokemytokennmytoken', // above 25 length limit, makePurse should fail
    merge: true,
    price: 1000,
    publicKey: PUBLIC_KEY_2,
  });
  if (
    purchaseFromZeroFailed1.status !== 'failed' ||
    purchaseFromZeroFailed1.message !==
      `error: purchase failed but was able to refund ${1000} error: rollback successful, makePurse error, transaction was rolled backed, emitter purse was reimbursed error: invalid purse, one of the following errors: id length must be between length 1 and 24`
  ) {
    console.log(purchaseFromZeroFailed1);
    throw new Error('purchase should have fail with proper error message (1)');
  }
  balances2.push(await getBalance(PUBLIC_KEY_2));

  await checkPursesInBox(masterRegistryUri, boxId2, contractId, []);
  await checkPursesInBox(
    masterRegistryUri,
    boxId1,
    contractId,
    ['0'].concat(ids)
  );

  console.log(`✓ 13 failed purchase, makePurse error`);

  const balance1BeforePurchaseFromZero = balances1[balances1.length - 1];
  const purchaseFromZeroSuccess = await purchase(PRIVATE_KEY_2, PUBLIC_KEY_2, {
    masterRegistryUri: masterRegistryUri,
    purseId: '0',
    contractId: contractId,
    boxId: boxId2,
    quantity: 1,
    data: 'bbb',
    newId: 'mynewnft',
    merge: true,
    price: 1000,
    publicKey: PUBLIC_KEY_2,
  });
  balances3.push(await getBalance(PUBLIC_KEY_3));
  balances2.push(await getBalance(PUBLIC_KEY_2));

  await checkPurseDataInContract(
    masterRegistryUri,
    contractId,
    'mynewnft',
    'bbb'
  );
  await checkPursesInBox(masterRegistryUri, boxId2, contractId, ['mynewnft']);
  await checkPursesInBox(
    masterRegistryUri,
    boxId1,
    contractId,
    ['0'].concat(ids)
  );
  await checkPursesInContract(
    masterRegistryUri,
    contractId,
    ['0', 'mynewnft'].concat(ids)
  );

  const balance1AfterPurchaseFromZero = await getBalance(PUBLIC_KEY);
  if (balance1BeforePurchaseFromZero + 980 !== balance1AfterPurchaseFromZero) {
    throw new Error('owner of box 1 did not receive payment from purchase');
  }

  if (balances3[1] + 20 !== balances3[2]) {
    throw new Error('owner of public key 3 did not receive fee from purchase');
  }

  console.log(`✓ 14 purchase from special purse "0" and create NFT`);
  console.log(`✓ 14 balance of purse's owner checked and has +980 dust`);
  console.log(`✓ 14 2% fee was earned by owner of public key 3`);

  console.log(
    '  14 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );

  const deletedPurse = await deleteExpiredPurse(
    PRIVATE_KEY_2,
    PUBLIC_KEY_2,
    masterRegistryUri,
    contractId,
    ids[0]
  );
  balances2.push(await getBalance(PUBLIC_KEY_2));
  console.log(
    '  15 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );
  await checkPursesInBox(
    masterRegistryUri,
    boxId1,
    contractId,
    ['0'].concat(ids.slice(1))
  );
  console.log(`✓ 15 deleted expired purse`);

  await withdraw(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    boxId2,
    contractId,
    1,
    ids[1]
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log(`✓ 16 withdraw`);
  const allData = await getAllData(masterRegistryUri, contractId);
  const timestampBeforeRenew = allData.purses[ids[1]].timestamp;

  // try to renew until we enter grace period
  await new Promise((resolve) => {
    let i = 0;
    const s = setInterval(() => {
      i += 1;
      renew(PRIVATE_KEY_2, PUBLIC_KEY_2, {
        masterRegistryUri: masterRegistryUri,
        purseId: ids[1],
        contractId: contractId,
        publicKey: PUBLIC_KEY_2,
        boxId: boxId2,
        price: 1000,
      }).then((renewSuccess) => {
        if (renewSuccess.status === 'completed') {
          resolve();
          clearInterval(s);
        } else {
          if (
            renewSuccess.message ===
            'error: renew failed but was able to refund 1000 error: to soon to renew'
          ) {
            console.log(renewSuccess.message);
            console.log(
              '  tried to renew',
              i,
              'time(s), it may be too soon, will retry'
            );
          } else {
            throw new Error('should have received to soon error');
          }
        }
      });
    }, 40000);
  });

  balances2.push(await getBalance(PUBLIC_KEY_2));
  balances1.push(await getBalance(PUBLIC_KEY));

  const allData2 = await getAllData(masterRegistryUri, contractId);
  const timestampAfterRenew = allData2.purses[ids[1]].timestamp;

  if (
    balances1[balances1.length - 2] + 1000 !==
    balances1[balances1.length - 1]
  ) {
    throw new Error('owner of public key 1 did not receive fee from renew');
  }

  if (timestampAfterRenew !== timestampBeforeRenew + EXPIRES) {
    throw new Error(
      'timestamp do not match + ' +
        EXPIRES +
        timestampBeforeRenew +
        ' ' +
        timestampAfterRenew
    );
  }
  console.log(`✓ 17 renewed purse, owner of purse 0 has +1000 dust`);

  await checkLogsInContract(
    masterRegistryUri,
    contractId,
    `p,${boxId1},${boxId2},1,1000,0,mynewnft;p,${boxId2},${boxId1},1,1000,${ids[0]},${ids[0]};`
  );
};

main();
