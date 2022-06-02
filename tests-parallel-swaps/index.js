const rc = require('@fabcotech/rchain-toolkit');
require('dotenv').config();

const swapTerm = require('../src').swapTerm
const fillBalances = require('../tests-ft/fillBalances').main;
const getBalance = require('../tests-ft/getBalance').main;
const credit = require('../tests-ft/test_credit').main;
const checkPursesInContract = require('../tests-ft/checkPursesInContract.js').main;
const updatePursePrice = require('../tests-ft/test_updatePursePrice.js').main;
const checkPursesInBox = require('../tests-ft/checkPursesInBox.js').main;
const deployBox = require('../tests-ft/test_deployBox').main;
const deploy = require('../tests-ft/test_deploy').main;
const deployMaster = require('../tests-ft/test_deployMaster').main;
const checkDefaultPurses = require('../tests-ft/test_checkDefaultPurses').main;
const createPurses = require('../tests-ft/test_createPurses.js').main;

const PRIVATE_KEY = '28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36';
const PUBLIC_KEY = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY);

const PRIVATE_KEY_2 = 'a2803d16030f83757a5043e5c0e28573685f6d8bf4e358bf1385d82bffa8e698';
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

  const t = new Date().getTime();
  await createPurses(
    PRIVATE_KEY,
    masterRegistryUri,
    contractId,
    boxId1,
    12,
    1
  );
    
  const creditResult = await credit(
    PRIVATE_KEY_2,
    {
      revAddress: rc.utils.revAddressFromPublicKey(PUBLIC_KEY_2),
      quantity: 100 * 12,
      masterRegistryUri: masterRegistryUri,
      boxId: boxId2
    }
  );
  await checkPursesInContract(
    masterRegistryUri,
    `${prefix}rev`,
    1,
    `1`,
    1200
  );
  await updatePursePrice(
    PRIVATE_KEY,
    masterRegistryUri,
    boxId1,
    contractId,
    `1`,
    [`"${prefix}rev"`, 100]
  );

  balances1.push(await getBalance(PUBLIC_KEY));
  await checkPursesInContract(
    masterRegistryUri,
    contractId,
    1,
    `1`,
    12
  );
  console.log(`✓ 05 create ${12} purses`);
  console.log(
    '  05 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );
  console.log(
    `  05 avg time of deploy+propose : ` +
      (new Date().getTime() - t) / 1000 +
      's'
  );
  
  const payload = {
    masterRegistryUri: masterRegistryUri,
    purseId: `1`,
    contractId: contractId,
    boxId: boxId2,
    quantity: 1, // invalid payload
    newId: 'none',
    merge: true,
  }
  let term = swapTerm(payload);
  // 13 times, 1 will fail
  for (let i = 0; i < 12; i += 1) {
    term += ` |
${swapTerm(payload)}`
  }

  const a = await rc.http.easyDeploy(
    process.env.VALIDATOR_HOST,
    {
      
      term: `new deployId(\`rho:rchain:deployId\`) in { deployId!("ok") } | ` + term
        .replaceAll('deployId(`rho:rchain:deployId`)', 'x')
        .replaceAll('deployId!', 'x!'),
      shardId: process.env.SHARD_ID,
      privateKey: PRIVATE_KEY_2,
      phloPrice: 'auto',
      phloLimit: 100000000,
      timeout: 60 * 1000 * 10
    }
  );

  // box 2 (buyer)
  await checkPursesInBox(masterRegistryUri, boxId2, contractId, `13`);
  await checkPursesInContract(
    masterRegistryUri,
    contractId,
    1,
    `13`,
    12
  );

  // box 1 (seller)
  await checkPursesInBox(
    masterRegistryUri,
    boxId1,
    `${prefix}rev`,
    '2'
  );
  await checkPursesInBox(
    masterRegistryUri,
    boxId1,
    contractId,
    `none`
  );

  console.log(`✓ 06 12 swaps successful, 1 did not go through`);
};

main();
