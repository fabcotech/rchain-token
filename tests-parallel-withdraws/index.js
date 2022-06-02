const rc = require('@fabcotech/rchain-toolkit');
require('dotenv').config();

const withdrawTerm = require('../src').withdrawTerm
const fillBalances = require('../tests-ft/fillBalances').main;
const getBalance = require('../tests-ft/getBalance').main;
const checkPursesInContract = require('../tests-ft/checkPursesInContract.js').main;
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
    withdrawQuantity: 1,
    purseId: '1',
    toBoxId: boxId2,
    boxId: boxId1,
    contractId: contractId,
    merge: true
  }
  let term = withdrawTerm(payload);
  // 13 times, 1 will fail
  for (let i = 0; i < 12; i += 1) {
    term += ` |
${withdrawTerm(payload)}`
  }

  await rc.http.easyDeploy(
    process.env.VALIDATOR_HOST,
    {
      term: `new deployId(\`rho:rchain:deployId\`) in { deployId!("ok") } | ` + term
        .replaceAll('deployId(`rho:rchain:deployId`)', 'x')
        .replaceAll('deployId!', 'x!'),
      shardId: process.env.SHARD_ID,
      privateKey: PRIVATE_KEY,
      phloPrice: 'auto',
      phloLimit: 100000000,
      timeout: 60 * 1000 * 10
    }
  );

  // box 1
  await checkPursesInBox(masterRegistryUri, boxId1, contractId, `none`);

  // box 2
  await checkPursesInBox(masterRegistryUri, boxId2, contractId, `13`);
  await checkPursesInContract(
    masterRegistryUri,
    contractId,
    1,
    `13`,
    12
  );

  console.log(`✓ 06 12 withdraws successful, 1 did not go through`);
};

main();
