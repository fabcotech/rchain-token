const rc = require('@fabcotech/rchain-toolkit');
require('dotenv').config();

const createPursesTerm = require('../../src').createPursesTerm
const fillBalances = require('../ft/fillBalances').main;
const getBalance = require('../ft/getBalance').main;
const deployBox = require('../ft/test_deployBox').main;
const getAllBoxData = require('../ft/getAllBoxData').main;
const deploy = require('../ft/test_deploy').main;
const deployMaster = require('../ft/test_deployMaster').main;
const checkDefaultPurses = require('../ft/test_checkDefaultPurses').main;
const { PRIVATE_KEY, PUBLIC_KEY, PRIVATE_KEY_2, PUBLIC_KEY_2, PRIVATE_KEY_3, PUBLIC_KEY_3 } = require('../ft/keys');

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

  /* await deployBox(
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
  ); */

  await checkDefaultPurses(masterRegistryUri, boxId1);
  console.log('✓ 02 check initial purses in boxes');

  const deployData = await deploy(
    PRIVATE_KEY,
    masterRegistryUri,
    boxId1,
    false,
    contractId,
    null
  );

  contractId = `${prefix}${contractId}`
  console.log('  Contact ID with prefix : ' + contractId)
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 03 deployed fungible/FT contract');
  console.log(
    '  03 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  const t = new Date().getTime();

  
  let term = ``;
  // 13 times, 1 will fail
  for (let i = 0; i < 40; i += 1) {
    const payload = {
      purses: {
        '1': {
          id: '' + (i > 19 ? 'nft20' : `nft${i}`),
          boxId: boxId1,
          quantity: 1,
          price: null,
        }
      },
      data: {},
      masterRegistryUri: masterRegistryUri,
      contractId: contractId,
      boxId: boxId1,
    };
    term += ` |
${createPursesTerm(payload)}`
  }

  term = `new deployId(\`rho:rchain:deployId\`) in { deployId!("ok") } ` + term
    .replaceAll('deployId(`rho:rchain:deployId`)', 'x')
    .replaceAll('deployId!', 'x!');

  await rc.http.easyDeploy(
    process.env.VALIDATOR_HOST,
    {
      term: term,
      shardId: process.env.SHARD_ID,
      privateKey: PRIVATE_KEY,
      phloPrice: 'auto',
      phloLimit: 100000000,
      timeout: 60 * 1000
    }
  );

  const allData = await getAllBoxData(masterRegistryUri, boxId1);
  if (allData.purses[contractId].length !== 21) {
    console.log(allData.purses[contractId].length)
    console.log(allData.purses[contractId].join(', '))
    throw new Error('21 NFT purses should have been succesfully created')
  }

  console.log("✓ 04 20 NFT creation successful our of 40 attempted")
  console.log('tests:parallelcreatetokens total time : ' + Math.round((new Date().getTime() - time) / 600) / 100 + 'min')
};

main();
