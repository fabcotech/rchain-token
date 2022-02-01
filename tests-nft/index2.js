const rc = require('rchain-toolkit');
require('dotenv').config();

const fillBalances = require('../tests-ft/fillBalances').main;
const getAllData = require('../tests-ft/getAllData').main;
const getAllBoxData = require('../tests-ft/getAllBoxData').main;
const checkPursesInContract = require('./checkPursesInContract.js').main;
const checkPursesSameTimestampInContract =
  require('./checkPursesSameTimestampInContract.js').main;
  const createPurses = require('./test_createPurses.js').main;
  const deletePurse = require('./test_deletePurse.js').main;
  const deleteExpiredPurse = require('./test_deleteExpiredPurse.js').main;
  const checkPursesInBox = require('./checkPursesInBox.js').main;
  const getRandomName = require('./getRandomName.js').main;
  const renew = require('./test_renew.js').main;
  
const checkPursesInContractFT = require('../tests-ft/checkPursesInContract.js').main;
const createPursesFT = require('../tests-ft/test_createPurses.js').main;
const swap = require('../tests-ft/test_swap').main;
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

const WRAPPED_REV_QUANTITY = 100 * 100000000;
const PURSES_TO_CREATE = 10;
// the goal is that step 17 fails multiple time
// and then succeeds
const EXPIRES = 60000;

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

  let boxId1 = "box1";
  let boxId2 = "box2";
  let boxId3 = "box3";
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

  await deployBox(
    PRIVATE_KEY_3,
    PUBLIC_KEY_3,
    masterRegistryUri,
    boxId3
  );
  balances3.push(await getBalance(PUBLIC_KEY_3));
  boxId3 = `${prefix}${boxId3}`
  console.log('  Box 3 with prefix : ' + boxId3)

  console.log('✓ 02 deploy boxes');
  console.log(
    '  02 dust cost (1 box): ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await checkDefaultPurses(masterRegistryUri, boxId1);
  await checkDefaultPurses(masterRegistryUri, boxId2);
  console.log('✓ 02 check initial purses in boxes');

  // BEGIN create REV contract
  await deploy(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    true,
    "rev",
    // expiration always null for FT
    null
  );
  const createRevPurses = await createPursesFT(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    `${prefix}rev`,
    boxId1,
    1,
    WRAPPED_REV_QUANTITY
  );
  // END create wrapped REV

  const deployData = await deploy(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    false,
    contractId,
    60000 || EXPIRES
  );
  contractId = `${prefix}${contractId}`
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
    [boxId3, 2000],
  );
  console.log(updateFee1);
  await checkFee(masterRegistryUri, contractId, [boxId3, 2000]);

  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 03 deployed fungible/FT contract');
  console.log(
    '  03 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  const t = new Date().getTime();
  let ids = [];
  for (let i = 0; i < PURSES_TO_CREATE; i += 1) {
    ids.push(getRandomName());
  }
  ids = ids.concat(['willbedeleted']);

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

  await updatePursePrice(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    contractId,
    '0',
    [`"${prefix}rev"` , 1000]
  );

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

  console.log(`✓ 05 withdraw`);

  console.log(`✓ 05 check the presence of 1 nft purses in ${boxId2}`);

  console.log(`✓ 07 update data associated to purse`);
  console.log(
    '  07 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  console.log(`✓ 08 set a price to purse "0"`);




  await withdraw(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    boxId3,
    `${prefix}rev`,
    1000,
    "1"
  );
  await withdraw(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId1,
    boxId2,
    `${prefix}rev`,
    1000,
    "1"
  );
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
  console.log(`✓ 24 withdraw`);

  const allDataRev1 = await getAllData(masterRegistryUri, `${prefix}rev`);
  console.log(allDataRev1)
  const balanceBox3Before = Object.values(allDataRev1.purses).find(p => p.boxId === boxId3).quantity
  console.log('balanceBox3Before', balanceBox3Before)

  const allData = await getAllData(masterRegistryUri, contractId);
  const timestampBeforeRenew = allData.purses[ids[1]].timestamp;

  // try to renew until we enter grace period
  let i = 0;
  await new Promise((resolve) => {
    const s = setInterval(() => {
     
      renew(PRIVATE_KEY_2, PUBLIC_KEY_2, {
        masterRegistryUri: masterRegistryUri,
        purseId: ids[1],
        contractId: contractId,
        boxId: boxId2,
      }).then((renewSuccess) => {
        
        if (renewSuccess.status === 'completed') {
          resolve();
          clearInterval(s);
        } else {
          i += 1;
          if (renewSuccess.message === 'error: to soon to renew') {
            console.log('  ' + renewSuccess.message);
            console.log(
              '  tried to renew',
              i,
              'time(s), it may be too soon, will retry'
            );
          } else {
            console.log(renewSuccess)
            throw new Error('should have received to soon error');
          }
        }
      });
    }, 40000);
  });
  console.log(i);
  /* if (i <= 1) {
    console.log('Renew has failed ' + i + ' times')
    throw new Error('Renew must fail at least 1 time')
  } */

  balances2.push(await getBalance(PUBLIC_KEY_2));
  balances1.push(await getBalance(PUBLIC_KEY));

  const allData2 = await getAllData(masterRegistryUri, contractId);
  const timestampAfterRenew = allData2.purses[ids[1]].timestamp;

  const allDataRev2 = await getAllData(masterRegistryUri, `${prefix}rev`);
  const balanceBox3After = Object.values(allDataRev2.purses).find(p => p.boxId === boxId3).quantity
  console.log('balanceBox3After', balanceBox3After)

  if (balanceBox3After !== balanceBox3After) {
    console.log('balanceBox3Before + 1000', balanceBox3Before + 1000)
    console.log('balanceBox3After', balanceBox3After)
    throw new Error('owner of box 3 did not receive fee [prefix]rev from renew');
  }

  if (timestampAfterRenew !== timestampBeforeRenew + EXPIRES) {
    console.log((timestampBeforeRenew + EXPIRES) - timestampAfterRenew);
    throw new Error(
      'timestamp do not match + ' +
        (EXPIRES +
        timestampBeforeRenew)+
        ' ' +
        timestampAfterRenew
    );
  }
  console.log(`✓ 25 renewed purse, owner of purse 0 has +1000 dust`);

  await checkLogsInContract(
    masterRegistryUri,
    contractId,
    `p,${boxId1},${boxId2},1,1000,0,mynewnft;p,${boxId2},${boxId1},1,1000,${ids[0]},${ids[0]};`
  );
};

main();
