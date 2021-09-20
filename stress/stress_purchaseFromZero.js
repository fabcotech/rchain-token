const rc = require('rchain-toolkit');
const fs = require('fs');

require('dotenv').config();

const getBalance = require('../tests-ft/getBalance').main;
const purchase = require('../tests-ft/test_purchase').main;
const updatePursePrice = require('../tests-ft/test_updatePursePrice').main;
const getRandomName = require('../tests-nft/getRandomName').main;
const deployBox = require('../tests-ft/test_deployBox').main;
const deploy = require('../tests-ft/test_deploy').main;
const checkDefaultPurses = require('../tests-ft/test_checkDefaultPurses').main;
const createPurses = require('../tests-nft/test_createPurses.js').main;
const checkPursesInBox = require('../tests-nft/checkPursesInBox.js').main;
const deployMaster = require('../tests-ft/test_deployMaster').main;

const PURSES_TO_PURCHASE_EACH_TIME = 40;

const PRIVATE_KEY =
  '28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36';
const PUBLIC_KEY = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY);

const PRIVATE_KEY_2 =
  'a2803d16030f83757a5043e5c0e28573685f6d8bf4e358bf1385d82bffa8e698';
const PUBLIC_KEY_2 = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY_2);

const balances1 = [];
const balances2 = [];

const main = async () => {
  balances1.push(await getBalance(PUBLIC_KEY));
  balances2.push(await getBalance(PUBLIC_KEY_2));

  const data = await deployMaster(PRIVATE_KEY, PUBLIC_KEY);
  const masterRegistryUri = data.registryUri.replace('rho:id:', '');
  console.log('masterRegistryUri', masterRegistryUri);

  const dataBox = await deployBox(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    'box'
  );
  balances1.push(await getBalance(PUBLIC_KEY));

  const dataBox2 = await deployBox(
    PRIVATE_KEY_2,
    PUBLIC_KEY_2,
    masterRegistryUri,
    'box2'
  );
  balances2.push(await getBalance(PUBLIC_KEY_2));

  const deployData = await deploy(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    'box',
    false,
    'mytoken',
    null,
    null
  );

  const c = await createPurses(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    'mytoken',
    'box',
    'box',
    []
  );
  if (c.status !== 'completed') {
    console.log(c);
    throw new Error('could not update purse price');
  }
  console.log('create 0 successful');

  const d = await updatePursePrice(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    'box',
    'mytoken',
    '0',
    1000
  );
  if (d.status !== 'completed') {
    console.log(d);
    throw new Error('could not update purse price');
  }
  console.log('update purse 0 price successful');

  let i = 0;
  let ids = [];
  const purchaseFromZero = async () => {
    i += 1;
    const newId = getRandomName();
    ids.push(newId);

    const purchaseFromZeroSuccess = await purchase(PRIVATE_KEY, PUBLIC_KEY, {
      masterRegistryUri: masterRegistryUri,
      purseId: '0',
      contractId: `mytoken`,
      boxId: `box`,
      quantity: 1,
      data: 'bbb',
      newId: newId,
      merge: true,
      price: 1000,
      publicKey: PUBLIC_KEY,
    });
    await checkPursesInBox(masterRegistryUri, 'box', 'mytoken', ids);
    console.log('purchase from zero successful');
    console.log('checked purses in box: ', ids.join(', '));

    if (i < 10) {
      purchaseFromZero();
    }
  };

  purchaseFromZero();

  return;
};

main();
