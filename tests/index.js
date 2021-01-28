const rc = require('rchain-toolkit');
require('dotenv').config();

const getBalance = require('./getBalance').main;
const getAllData = require('./getAllData').main;
const deploy = require('./01_deploy').main;
const checkBagsAndTokens = require('./02_checkBagsAndTokens.js').main;
const createTokens = require('./03_createTokens.js').main;
const checkBagsAndTokens2 = require('./04_checkBagsAndTokens.js').main;
const purchase = require('./05_purchase.js').main;
const checkBagsAndTokens3 = require('./06_checkBagsAndTokens.js').main;
const updateBagData = require('./07_updateBagData.js').main;
const checkBagData = require('./08_checkBagData.js').main;
const sendTokens = require('./09_sendTokens.js').main;
const checkBagsAndTokens4 = require('./10_checkBagsAndTokens.js').main;

const BAGS_TO_CREATE = 100;

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
  const data = await deploy(PRIVATE_KEY, PUBLIC_KEY);
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 01 deploy');
  console.log(
    '  01 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );
  await checkBagsAndTokens(data.registryUri.replace('rho:id:', ''));
  console.log('✓ 02 check initial bags and data');
  await createTokens(
    data.registryUri.replace('rho:id:', ''),
    PRIVATE_KEY,
    PUBLIC_KEY,
    data.nonce,
    BAGS_TO_CREATE
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log(`✓ 03 create ${BAGS_TO_CREATE} bags`);
  console.log(
    '  03 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );
  await checkBagsAndTokens2(
    data.registryUri.replace('rho:id:', ''),
    BAGS_TO_CREATE
  );
  console.log(`✓ 04 check the presence of ${BAGS_TO_CREATE} bags`);
  await purchase(
    data.registryUri.replace('rho:id:', ''),
    PRIVATE_KEY_2,
    PUBLIC_KEY_2
  );
  balances2.push(await getBalance(PUBLIC_KEY_2));
  console.log('✓ 05 purchase 1 token from bag 1');
  console.log(
    '  05 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );
  const lastBag = await checkBagsAndTokens3(
    data.registryUri.replace('rho:id:', ''),
    BAGS_TO_CREATE,
    PUBLIC_KEY_2
  );
  console.log(`✓ 06 check the presence of ${BAGS_TO_CREATE + 1} bags`);
  await updateBagData(
    data.registryUri.replace('rho:id:', ''),
    lastBag.nonce,
    BAGS_TO_CREATE,
    PRIVATE_KEY_2,
    PUBLIC_KEY_2
  );
  balances2.push(await getBalance(PUBLIC_KEY_2));
  console.log(`✓ 07 update data associated with bag ${BAGS_TO_CREATE}`);
  console.log(
    '  07 dust cost: ' +
      (balances2[balances2.length - 2] - balances2[balances2.length - 1])
  );
  await checkBagData(data.registryUri.replace('rho:id:', ''), BAGS_TO_CREATE);
  console.log(`✓ 08 check data associated with bag ${BAGS_TO_CREATE}`);
  const allData = await getAllData(data.registryUri.replace('rho:id:', ''));
  await sendTokens(
    data.registryUri.replace('rho:id:', ''),
    allData.bags['1'].nonce,
    PRIVATE_KEY,
    PUBLIC_KEY
  );
  balances1.push(await getBalance(PUBLIC_KEY));
  console.log(`✓ 09 send 1 token from bag 1`);
  console.log(
    '  09 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );
  await checkBagsAndTokens4(
    data.registryUri.replace('rho:id:', ''),
    BAGS_TO_CREATE
  );
  console.log(`✓ 10 check the presence of ${BAGS_TO_CREATE + 2} bags`);
};

main();
