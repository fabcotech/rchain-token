const rc = require('rchain-toolkit');
require('dotenv').config();

const getAllData = require('../tests-ft/getAllData').main;
const checkPursesInContract = require('./checkPursesInContract.js').main;
const checkPursesSameTimestampInContract =
  require('./checkPursesSameTimestampInContract.js').main;
const createPurses = require('./test_createPurses.js').main;
const deleteExpiredPurse = require('./test_deleteExpiredPurse.js').main;
const checkPursesInBox = require('./checkPursesInBox.js').main;
const getRandomName = require('./getRandomName.js').main;
const renew = require('./test_renew.js').main;

const checkPursePriceInContract =
  require('../tests-ft/checkPursePriceInContract.js').main;
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
const EXPIRES = 570000;

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
    'box1'
  );
  balances1.push(await getBalance(PUBLIC_KEY));

  const secondDataBox = await deployBox(
    PRIVATE_KEY_2,
    PUBLIC_KEY_2,
    masterRegistryUri,
    'box2'
  );
  balances2.push(await getBalance(PUBLIC_KEY_2));

  console.log('✓ 02 deploy boxes');
  console.log(
    '  02 dust cost (1 box): ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await checkDefaultPurses(masterRegistryUri, 'box1');
  await checkDefaultPurses(masterRegistryUri, 'box2');
  console.log('✓ 02 check initial purses in boxes');

  const deployData = await deploy(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    'box1',
    false,
    'mytoken',
    // 2% fee
    // 2.000 is 2% of 100.000
    [PUBLIC_KEY_3, 2000],
    EXPIRES
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

  const createdPursesFailed = await createPurses(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    'mytoken',
    'box1',
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
  const ids = [];
  for (let i = 0; i < PURSES_TO_CREATE; i += 1) {
    ids.push(getRandomName());
  }

  await createPurses(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    'mytoken',
    'box1',
    'box1',
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

  await checkPursesInBox(masterRegistryUri, 'box1', 'mytoken', [ids[0]]);
  await checkPursesInContract(masterRegistryUri, 'mytoken', ['0'].concat(ids));
  console.log(`✓ 04 check the presence of ${ids.length} purses with quantity`);

  await withdraw(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    'box1',
    'box2',
    1,
    ids[0] // id of the purse to withdraw from
  );

  console.log(`✓ 05 withdraw`);
  await checkPursesInBox(
    masterRegistryUri,
    'box1',
    'mytoken',
    ids.filter((id) => id !== ids[0])
  );
  await checkPursesInBox(masterRegistryUri, 'box2', 'mytoken', [ids[0]]);
  await checkPursesInContract(masterRegistryUri, 'mytoken', ids);

  console.log(`✓ 05 check the presence of 1 nft purses in box2`);
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log(
    '  05 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await updatePurseData(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    'box1',
    'mytoken',
    '0',
    'aaa'
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  await checkPurseDataInContract(masterRegistryUri, 'mytoken', '0', 'aaa');

  console.log(`✓ 07 update data associated to purse`);
  console.log(
    '  07 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await updatePursePrice(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    'box1',
    'mytoken',
    '0',
    1000
  );

  balances1.push(await getBalance(PUBLIC_KEY));
  await checkPursePriceInContract(masterRegistryUri, 'mytoken', '0', 1000);
  console.log(`✓ 08 set a price to purse "0"`);
  console.log(
    '  08 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await updatePursePrice(
    PRIVATE_KEY_2,
    PUBLIC_KEY_2,
    masterRegistryUri,
    'box2',
    'mytoken',
    ids[0],
    1000
  );

  balances2.push(await getBalance(PUBLIC_KEY_2));
  await checkPursePriceInContract(masterRegistryUri, 'mytoken', ids[0], 1000);
  console.log(`✓ 09 set a price to a purse`);
  console.log(
    '  09 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );

  const balance2BeforePurchase = balances2[balances2.length - 1];
  const purchaseFailed1 = await purchase(PRIVATE_KEY, PUBLIC_KEY, {
    masterRegistryUri: masterRegistryUri,
    purseId: ids[0],
    contractId: `mytoken`,
    boxId: `box1`,
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
    contractId: `mytoken`,
    boxId: `box1`,
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
    contractId: `mytoken`,
    boxId: `box1`,
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
    'box1',
    'mytoken',
    ['0'].concat(ids)
  );
  await checkPursesInBox(masterRegistryUri, 'box2', 'mytoken', []);
  await checkPursesInContract(masterRegistryUri, 'mytoken', ids);
  await checkPursesSameTimestampInContract(masterRegistryUri, 'mytoken', [
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
    contractId: `mytoken`,
    boxId: `box2`,
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

  await checkPursesInBox(masterRegistryUri, 'box2', 'mytoken', []);
  await checkPursesInBox(
    masterRegistryUri,
    'box1',
    'mytoken',
    ['0'].concat(ids)
  );

  console.log(`✓ 13 failed purchase, makePurse error`);

  const balance1BeforePurchaseFromZero = balances1[balances1.length - 1];
  const purchaseFromZeroSuccess = await purchase(PRIVATE_KEY_2, PUBLIC_KEY_2, {
    masterRegistryUri: masterRegistryUri,
    purseId: '0',
    contractId: `mytoken`,
    boxId: `box2`,
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
    'mytoken',
    'mynewnft',
    'bbb'
  );
  await checkPursesInBox(masterRegistryUri, 'box2', 'mytoken', ['mynewnft']);
  await checkPursesInBox(
    masterRegistryUri,
    'box1',
    'mytoken',
    ['0'].concat(ids)
  );
  await checkPursesInContract(
    masterRegistryUri,
    'mytoken',
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
    'mytoken',
    ids[0]
  );
  balances2.push(await getBalance(PUBLIC_KEY_2));
  console.log(
    '  15 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );
  await checkPursesInBox(
    masterRegistryUri,
    'box1',
    'mytoken',
    ['0'].concat(ids.slice(1))
  );
  console.log(`✓ 15 deleted expired purse`);

  await withdraw(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    'box1',
    'box2',
    1,
    ids[1]
  );
  balances1.push(await getBalance(PUBLIC_KEY));

  const allData = await getAllData(masterRegistryUri, 'mytoken');
  const timestampBeforeRenew = allData.purses[ids[1]].timestamp;

  // try to renew until we enter grace period
  await new Promise((resolve) => {
    let i = 0;
    const s = setInterval(() => {
      i += 1;
      renew(PRIVATE_KEY_2, PUBLIC_KEY_2, {
        masterRegistryUri: masterRegistryUri,
        purseId: ids[1],
        contractId: `mytoken`,
        publicKey: PUBLIC_KEY_2,
        boxId: `box2`,
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

  const allData2 = await getAllData(masterRegistryUri, 'mytoken');
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
};

main();
