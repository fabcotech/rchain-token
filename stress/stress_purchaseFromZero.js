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

const PURSES_TO_PURCHASE_EACH_TIME = 1;
const BOX_ID = 'box';
const BOX_EXISTS = false;
const BOX2_ID = 'box2';
const BOX2_EXISTS = false;
const CONTRACT_ID = 'mytoken';
const CONTRACT_EXISTS = false;
const MASTER_REGISTRY_URI = undefined;
const PRICE = 1000;

const PRIVATE_KEY =
  '28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36';
const PUBLIC_KEY = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY);

const PRIVATE_KEY_2 =
  'a2803d16030f83757a5043e5c0e28573685f6d8bf4e358bf1385d82bffa8e698';
const PUBLIC_KEY_2 = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY_2);

const balances1 = [];
const balances2 = [];

const main = async () => {
  const time = (new Date().getTime() + '').slice(0, 10);
  balances1.push(await getBalance(PUBLIC_KEY));
  balances2.push(await getBalance(PUBLIC_KEY_2));

  let masterRegistryUri = MASTER_REGISTRY_URI;
  if (!masterRegistryUri) {
    const data = await deployMaster(PRIVATE_KEY, PUBLIC_KEY);
    masterRegistryUri = data.registryUri.replace('rho:id:', '');
  }
  console.log('  masterRegistryUri', masterRegistryUri);

  if (!BOX_EXISTS) {
    const dataBox = await deployBox(
      PRIVATE_KEY,
      PUBLIC_KEY,
      masterRegistryUri,
      BOX_ID
    );
    balances1.push(await getBalance(PUBLIC_KEY));
  }
  if (!BOX2_EXISTS) {
    const dataBox = await deployBox(
      PRIVATE_KEY_2,
      PUBLIC_KEY_2,
      masterRegistryUri,
      BOX2_ID
    );
    balances2.push(await getBalance(PUBLIC_KEY_2));
  }
  console.log('  box id ', BOX_ID);
  console.log('  box id 2', BOX2_ID);

  if (!CONTRACT_EXISTS) {
    const deployData = await deploy(
      PRIVATE_KEY,
      PUBLIC_KEY,
      masterRegistryUri,
      BOX_ID,
      false,
      CONTRACT_ID,
      null,
      null
    );
    const c = await createPurses(
      PRIVATE_KEY,
      PUBLIC_KEY,
      masterRegistryUri,
      CONTRACT_ID,
      BOX_ID,
      BOX_ID,
      []
    );
    if (c.status !== 'completed') {
      console.log(c);
      throw new Error('could not create purse 0');
    }
    console.log('  create 0 successful');
  }
  console.log('  contract id', CONTRACT_ID);

  const d = await updatePursePrice(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    BOX_ID,
    CONTRACT_ID,
    '0',
    PRICE
  );
  if (d.status !== 'completed') {
    console.log(d);
    throw new Error('could not update purse price');
  }
  console.log('  update purse 0 price successful');

  let i = 0;
  let ids = [];
  const purchaseFromZero = async () => {
    i += 1;

    const t = new Date().getTime();
    const arr = [];
    for (let i = 0; i < PURSES_TO_PURCHASE_EACH_TIME; i += 1) {
      const newId = getRandomName();
      ids.push(newId);
      arr.push(
        purchase(PRIVATE_KEY_2, PUBLIC_KEY_2, {
          masterRegistryUri: masterRegistryUri,
          purseId: '0',
          contractId: `mytoken`,
          boxId: BOX2_ID,
          quantity: 1,
          data: 'bbb',
          newId: newId,
          merge: true,
          price: PRICE,
          publicKey: PUBLIC_KEY_2,
        })
      );
    }
    console.log(
      `  will deploy ${PURSES_TO_PURCHASE_EACH_TIME} purchase-from-zero`
    );

    const purchaseFromZeroSuccess = await Promise.all(arr);

    const itTook = Math.round(0.1 * (new Date().getTime() - t)) / 100;
    await checkPursesInBox(masterRegistryUri, BOX2_ID, CONTRACT_ID, ids);
    console.log('purchase from zero successful');
    console.log('checked purses in box: ', ids.join(', '));

    const filename = `./stresslogs/stress_purchase_from_zero_logs_${time}.txt`;
    let s = '';
    try {
      s = fs.readFileSync(filename, 'utf8');
    } catch (e) {}
    if (!s.length) {
      s += `${filename}\nPURSES_TO_PURCHASE_EACH_TIME:${PURSES_TO_PURCHASE_EACH_TIME}\nBOX_ID:${BOX_ID}\nCONTRACT_ID:${CONTRACT_ID}\n`;
    }

    s += `${new Date().toString()}\n✓ ${i} purchased ${PURSES_TO_PURCHASE_EACH_TIME} purses/NFT from 0 in ${itTook}s\n`;

    fs.writeFileSync(filename, s, 'utf8');
    purchaseFromZero();
  };

  purchaseFromZero();

  return;
};

main();
