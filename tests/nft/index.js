const rc = require('@fabcotech/rchain-toolkit');
require('dotenv').config();

const checkPursesInContract = require('./checkPursesInContract.js').main;
const createPurses = require('./test_createPurses.js').main;
const deletePurse = require('./test_deletePurse.js').main;
const deleteExpiredPurse = require('./test_deleteExpiredPurse.js').main;
const checkPursesInBox = require('./checkPursesInBox.js').main;
const getRandomName = require('./getRandomName.js').main;
const renew = require('./test_renew.js').main;

const credit = require('../ft/test_credit').main;
const fillBalances = require('../ft/fillBalances').main;
const getAllData = require('../ft/getAllData').main;
const getAllBoxData = require('../ft/getAllBoxData').main;
const checkPursesInContractFT = require('../ft/checkPursesInContract.js').main;
const swap = require('../ft/test_swap').main;
const checkPursePriceInContract =
  require('../ft/checkPursePriceInContract.js').main;
const checkFee = require('../ft/checkFee').main;
const updateFee = require('../ft/test_updateFee').main;
const checkPurseDataInContract =
  require('../ft/checkPurseDataInContract.js').main;
const getBalance = require('../ft/getBalance').main;
const deployBox = require('../ft/test_deployBox').main;
const deploy = require('../ft/test_deploy').main;
const deployMaster = require('../ft/test_deployMaster').main;
const withdraw = require('../ft/test_withdraw').main;
const checkDefaultPurses = require('../ft/test_checkDefaultPurses').main;
const updatePurseData = require('../ft/test_updatePurseData.js').main;
const updatePursePrice = require('../ft/test_updatePursePrice.js').main;

const { PRIVATE_KEY, PUBLIC_KEY, PRIVATE_KEY_2, PUBLIC_KEY_2, PRIVATE_KEY_3, PUBLIC_KEY_3 } = require('../ft/keys');

const WRAPPED_REV_QUANTITY = 100 * 100000000;
const PURSES_TO_CREATE = 10;
// the goal is that step 17 fails multiple time
// and then succeeds
const EXPIRES = 600000;

const balances1 = [];
const balances2 = [];
const balances3 = [];

const main = async () => {
  const time = new Date().getTime();
  await fillBalances(PRIVATE_KEY, PUBLIC_KEY, PUBLIC_KEY_2, PUBLIC_KEY_3);
  balances1.push(await getBalance(PUBLIC_KEY));
  balances2.push(await getBalance(PUBLIC_KEY_2));
  balances3.push(await getBalance(PUBLIC_KEY_3));
  console.log(`  balances (dust) : (1) ${balances1[0]}, (2) ${balances2[0]}, (3) ${balances3[0]}`)

  let boxId1 = "box1";
  let boxId2 = "box2";
  let boxId3 = "box3";
  let contractId = "mytoken";
  let prefix = '';

  const data = await deployMaster(PRIVATE_KEY);
  const masterRegistryUri = data.registryUri.replace('rho:id:', '');
  prefix = masterRegistryUri.slice(0, 3);

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
    masterRegistryUri,
    boxId1,
    false,
    contractId,
    EXPIRES
  );
  contractId = `${prefix}${contractId}`
  console.log('  Contract ID with prefix : ' + contractId)

  await checkFee(masterRegistryUri, contractId, null);
  // If you purchase a token at 100 REV
  // seller gets 98 REV
  // owner of the contract gets 2 REV
  const updateFee1 = await updateFee(
    PRIVATE_KEY,
    masterRegistryUri,
    boxId1,
    contractId,
    // 2% fee
    // 2.000 is 2% of 100.000
    [boxId3, 2000],
  );

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
    masterRegistryUri,
    boxId1,
    contractId,
    '0',
    [`"${prefix}rev"` , 1000]
  );

  balances1.push(await getBalance(PUBLIC_KEY));
  await checkPursePriceInContract(masterRegistryUri, contractId, '0', [`${prefix}rev` , 1000]);
  console.log(`✓ 08 set a price to purse "0"`);
  console.log(
    '  08 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  await updatePursePrice(
    PRIVATE_KEY_2,
    masterRegistryUri,
    boxId2,
    contractId,
    ids[0],
    [`"${prefix}rev"` , 1000]
  );

  balances2.push(await getBalance(PUBLIC_KEY_2));
  await checkPursePriceInContract(masterRegistryUri, contractId, ids[0], [`${prefix}rev` , 1000]);
  console.log(`✓ 09 set a price to a purse`);
  console.log(
    '  09 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );

  await updatePurseData(
    PRIVATE_KEY_2,
    masterRegistryUri,
    boxId2,
    contractId,
    ids[0],
    'ddd'
  );

  const swapSuccess1 = await swap(PRIVATE_KEY, {
    masterRegistryUri: masterRegistryUri,
    purseId: ids[0],
    contractId: contractId,
    boxId: boxId1,
    quantity: 1,
    newId: 'none',
    merge: true,
  });
  balances1.push(await getBalance(PUBLIC_KEY));
  balances3.push(await getBalance(PUBLIC_KEY_3));
  if (swapSuccess1.status !== 'completed') {
    console.log(swapSuccess1)
    throw new Error('swap should have been successful');
  }

  // mytoken tests
  await checkPursesInBox(
    masterRegistryUri,
    boxId1,
    contractId,
    ["0"].concat(ids)
  );
  await checkPursesInBox(
    masterRegistryUri,
    boxId2,
    contractId,
    [] 
  );

  // rev checks
  await checkPursesInBox(
    masterRegistryUri,
    boxId1,
    `${prefix}rev`,
    [`1`]
  );
  await checkPursesInBox(
    masterRegistryUri,
    boxId2,
    `${prefix}rev`,
    [`2`]
  );
  await checkPursesInBox(
    masterRegistryUri,
    boxId3,
    `${prefix}rev`,
    [`3`]
  );
  await checkPursesInContractFT(
    masterRegistryUri,
    `${prefix}rev`,
    3,
    `2`,
    980
  );
  await checkPursesInContractFT(
    masterRegistryUri,
    `${prefix}rev`,
    3,
    `3`,
    20
  );
  await checkPursesInContractFT(
    masterRegistryUri,
    `${prefix}rev`,
    3,
    `1`,
    WRAPPED_REV_QUANTITY - 1000
  );
  await checkPurseDataInContract(masterRegistryUri, contractId, ids[0], 'ddd');

  console.log(`✓ 12 swap nft<->ft successful`);
  console.log(`✓ 12 nft changed hands but the data was untouched`);
  console.log(`✓ 12 balance of nft owner checked and has +980 [prefix]rev`);
  console.log(`✓ 12 2% fee of [prefix]rev was earned by owner of box 3`);

  console.log(`✓ 12.1 logs valid`);

  console.log(
    '  12 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  const swapMintFailure1 = await swap(PRIVATE_KEY_2, {
    masterRegistryUri: masterRegistryUri,
    purseId: "0",
    contractId: contractId,
    boxId: boxId2,
    quantity: 1,
    data: 'ccc',
    newId: 'mytokemytokennmytokenmytokemytokennmytokenmytokemytokennmytoken', // above 25 length limit, makePurse should fail
    merge: true,
  });
  balances2.push(await getBalance(PUBLIC_KEY_2));
  if (
    swapMintFailure1.status !== 'failed' ||
    swapMintFailure1.message !== "error: box or contract not found or invalid payload"
  ) {
    console.log(swapMintFailure1);
    throw new Error('swap mint should have fail with proper error message (1)');
  }
  await checkPursesInBox(
    masterRegistryUri,
    boxId1,
    contractId,
    ["0"].concat(ids)
  );
  await checkPursesInBox(
    masterRegistryUri,
    boxId2,
    contractId,
    [] 
  );
  console.log(`✓ 13 swap mint has failed because of invalid payload`);
  
  const swapMintFailure2 = await swap(PRIVATE_KEY_2, {
    masterRegistryUri: masterRegistryUri,
    purseId: "0",
    contractId: contractId,
    boxId: boxId2,
    quantity: 1,
    data: 'ccc',
    newId: 'mynewnft',
    merge: true,
  });
  balances2.push(await getBalance(PUBLIC_KEY_2));
  if (
    swapMintFailure2.status !== 'failed' ||
    swapMintFailure2.message !== `error: box cannot fulfil order`
  ) {
    console.log(swapMintFailure2);
    throw new Error('swap mint should have fail with proper error message (2)');
  }
  await checkPursesInBox(
    masterRegistryUri,
    boxId1,
    contractId,
    ["0"].concat(ids)
  );
  await checkPursesInBox(
    masterRegistryUri,
    boxId2,
    contractId,
    [] 
  );
  console.log(`✓ 14 swap mint has failed because of unsuffiscient wrapped [prefix]rev`);

  await withdraw(
    PRIVATE_KEY,
    masterRegistryUri,
    boxId1,
    boxId2,
    `${prefix}rev`,
    20,
    "1" // id of the purse to withdraw from
  );

  const swapMintSuccess = await swap(PRIVATE_KEY_2, {
    masterRegistryUri: masterRegistryUri,
    purseId: "0",
    contractId: contractId,
    boxId: boxId2,
    quantity: 1,
    data: 'ccc',
    newId: 'mynewnft',
    merge: true,
  });
  balances2.push(await getBalance(PUBLIC_KEY_2));

  // mytoken checks
  await checkPursesInBox(
    masterRegistryUri,
    boxId1,
    contractId,
    ["0"].concat(ids)
  );
  await checkPursesInBox(
    masterRegistryUri,
    boxId2,
    contractId,
    ['mynewnft'] 
  );
  // rev checks
  await checkPursesInContractFT(
    masterRegistryUri,
    `${prefix}rev`,
    2,
    `1`,
    WRAPPED_REV_QUANTITY - 40
  );
  await checkPursesInContractFT(
    masterRegistryUri,
    `${prefix}rev`,
    2,
    `3`,
    40
  );
  console.log(`✓ 15 swap mint (purse "0") successful`);
  console.log(`✓ 15 2% fee of [prefix]rev was again earned by owner of box 3`);

  const logsStep15 = `p,${boxId1},${boxId2},1,ft_${prefix}rev_1000,0,mynewnft;p,${boxId2},${boxId1},1,ft_${prefix}rev_1000,${ids[0]},${ids[0]};`;


  const priceUpdateFailed1 = await updatePursePrice(
    PRIVATE_KEY,
    masterRegistryUri,
    boxId1,
    contractId,
    ids[1],
    [`"${contractId}"` , `"0"`]
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  if (
    priceUpdateFailed1.status !== 'failed' ||
    priceUpdateFailed1.message !== `error: you cannot ask for purse zero in exchange of swap`
  ) {
    console.log(priceUpdateFailed1);
    throw new Error('price update should have failed with proper error message (1)');
  }
  console.log(`✓ 16 update purse price with (String, "0") failed`);

  const priceUpdateFailed2 = await updatePursePrice(
    PRIVATE_KEY,
    masterRegistryUri,
    boxId1,
    contractId,
    "0",
    [`"${contractId}"` , `"mynewnft"`]
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  if (
    priceUpdateFailed2.status !== 'failed' ||
    priceUpdateFailed2.message !== `error: purse zero cannot be swapped with NFT`
  ) {
    console.log(priceUpdateFailed2);
    throw new Error('price update should have failed with proper error message (2)');
  }
  console.log(`✓ 17 update purse "0" price in exchange for nft failed`);

  await updatePursePrice(
    PRIVATE_KEY,
    masterRegistryUri,
    boxId1,
    contractId,
    ids[1],
    [`"${contractId}"` , `"mynewnft"`]
  );

  balances1.push(await getBalance(PUBLIC_KEY));
  await checkPursePriceInContract(masterRegistryUri, contractId, ids[1], [contractId , "mynewnft"]);
  console.log(`✓ 18 purse ids[1] price updated, sell order for nft<->nft "mynewnft"`);

  const swapSuccess2 = await swap(PRIVATE_KEY_2, {
    masterRegistryUri: masterRegistryUri,
    purseId: ids[1],
    contractId: contractId,
    boxId: boxId2,
    quantity: 1,
    data: '',
    newId: 'none',
    merge: true,
  });
  balances2.push(await getBalance(PUBLIC_KEY_2));
  if (swapSuccess2.status !== 'completed') {
    console.log(swapSuccess2)
    throw new Error('swap should have been successful');
  }
  await checkPursesInBox(
    masterRegistryUri,
    boxId1,
    contractId,
    ["0", "mynewnft"].concat(ids).filter(i => i !== ids[1])
  );
  await checkPursesInBox(
    masterRegistryUri,
    boxId2,
    contractId,
    [ids[1]] 
  );
  console.log(`✓ 19 swap nft<->nft successful`);

  await updatePursePrice(
    PRIVATE_KEY_3,
    masterRegistryUri,
    boxId3,
    `${prefix}rev`,
    "3",
    [`"${contractId}"` , `"mynewnft"`]
  );
  balances3.push(await getBalance(PUBLIC_KEY_3));
  await checkPursePriceInContract(masterRegistryUri, `${prefix}rev`, "3", [contractId , "mynewnft"]);
  console.log(`✓ 20 purse that has 20 [prefix]rev price updated, sell order for nft "mynewnft"`);

  const swapSuccess3 = await swap(PRIVATE_KEY, {
    masterRegistryUri: masterRegistryUri,
    purseId: "3",
    contractId: `${prefix}rev`,
    boxId: boxId1,
    quantity: 1,
    data: 'ddd',
    newId: 'none',
    merge: true,
  });
  balances1.push(await getBalance(PUBLIC_KEY));
  if (swapSuccess3.status !== 'completed') {
    console.log(swapSuccess3)
    throw new Error('swap should have been successful');
  }
  await checkPursesInBox(
    masterRegistryUri,
    boxId1,
    contractId,
    ["0"].concat(ids).filter(i => i !== ids[1])
  );
  await checkPursesInBox(
    masterRegistryUri,
    boxId3,
    contractId,
    ["mynewnft"] 
  );
  // box 1 has got all the [prefix]rev back
  await checkPursesInContractFT(
    masterRegistryUri,
    `${prefix}rev`,
    1,
    `1`,
    WRAPPED_REV_QUANTITY
  );
  console.log(`✓ 21 swap ft<->nft successful`);

  const tryToBurnPurseThatExpires = await withdraw(
    PRIVATE_KEY,
    masterRegistryUri,
    boxId1,
    "_burn",
    contractId,
    1,
    ids[2]
  );
  console.log(tryToBurnPurseThatExpires)
  if (tryToBurnPurseThatExpires.status !== "failed") {
    throw new Error('Should have failed to burn a NFT that expires')
  }

  console.log(`✓ 21.1 failed to burn purse/NFT that expires`);

  await checkPursesInContract(
    masterRegistryUri,
    contractId,
    ['0', 'mynewnft'].concat(ids)
  );

  // box 3 will delete one of 
  // box 1's NFT
  await new Promise((resolve) => {
    const s = setInterval(async () => {
      const deletedPurse = await deleteExpiredPurse(
        PRIVATE_KEY_3,
        masterRegistryUri,
        contractId,
        boxId1,
        ids[0]
      );
      console.log('deletedPurse')
      console.log(deletedPurse)
      if (deletedPurse.status === 'completed') {
        resolve();
        clearInterval(s);
      } else {
        console.log(
          '  tried to delete expired purse, it may be too soon, will retry'
        );
      }
    }, 40000);
  });
  balances3.push(await getBalance(PUBLIC_KEY_3));

  await checkPursesInBox(
    masterRegistryUri,
    boxId1,
    contractId,
    ['0'].concat(ids.slice(4))
  );
  console.log(`✓ 23 private key  deleted expired purse of box1`);

  // box 2 will try to renew purse ids[5]
  await withdraw(
    PRIVATE_KEY,
    masterRegistryUri,
    boxId1,
    boxId2,
    contractId,
    1,
    ids[5]
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log(`✓ 24 withdraw box1->box2 nft ids[5]`);

  // box2 must have enough [prefix]rev to renew (1000)
  await withdraw(
    PRIVATE_KEY,
    masterRegistryUri,
    boxId1,
    boxId2,
    `${prefix}rev`,
    1000,
    "1"
  );
  balances1.push(await getBalance(PUBLIC_KEY));

  console.log(`✓ 24 withdraw box1->box2 1000 [prefix]rev so that box2 can renew`);

  const allDataRev1 = await getAllData(masterRegistryUri, `${prefix}rev`);
  let balanceBox1Before = 0;
  try {
    balanceBox1Before = Object.values(allDataRev1.purses).find(p => p.boxId === boxId1).quantity
  } catch (err) {
  }

  const allData = await getAllData(masterRegistryUri, contractId);
  const timestampBeforeRenew = allData.purses[ids[5]].timestamp;

  // try to renew until we enter grace period
  let i = 0;
  await new Promise((resolve) => {
    const s = setInterval(() => {
     
      renew(PRIVATE_KEY_2, {
        masterRegistryUri: masterRegistryUri,
        purseId: ids[5],
        contractId: contractId,
        boxId: boxId2,
      }).then((renewSuccess) => {
        console.log(renewSuccess);
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

  balances2.push(await getBalance(PUBLIC_KEY_2));

  const allData2 = await getAllData(masterRegistryUri, contractId);
  const timestampAfterRenew = allData2.purses[ids[5]].timestamp;

  const allDataRev2 = await getAllData(masterRegistryUri, `${prefix}rev`);
  const balanceBox1After = Object.values(allDataRev2.purses).find(p => p.boxId === boxId1).quantity
  console.log('balanceBox1After', balanceBox1After)

  if (balanceBox1After !== balanceBox1Before + 1000) {
    console.log('balanceBox1Before + 1000', balanceBox1Before + 1000)
    console.log('balanceBox1After', balanceBox1After)
    throw new Error('owner of box 1 did not receive 1000 [prefix]rev from renew');
  }

  if (timestampAfterRenew !== timestampBeforeRenew + EXPIRES) {
    console.log((timestampBeforeRenew + EXPIRES) - timestampAfterRenew);
    throw new Error(
      'timestamps do not match + ' +
        (EXPIRES +
        timestampBeforeRenew)+
        ' ' +
        timestampAfterRenew
    );
  }
  console.log(`✓ 25 renewed purse, owner of purse 0 (box1) has +1000 dust`);
  console.log('tests:nft total time : ' + Math.round((new Date().getTime() - time) / 600) / 100 + 'min')
};

main();
