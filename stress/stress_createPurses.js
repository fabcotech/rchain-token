const rc = require('rchain-toolkit');
const fs = require('fs');

require('dotenv').config();

const getBalance = require('../tests-ft/getBalance').main;
const getRandomName = require('../tests-nft/getRandomName').main;
const deployBox = require('../tests-ft/test_deployBox').main;
const deployMaster = require('../tests-ft/test_deployMaster').main;
const deploy = require('../tests-ft/test_deploy').main;

const createPurses = require('./test_createPurses.js').main;
const checkPursesInBox = require('../tests-nft/checkPursesInBox.js').main;

const PURSES_TO_CREATE = 100;
const PURSES_TO_CREATE_INITIAL = 100;
const NEW_BOX_EACH_TIME = true;

const PRIVATE_KEY =
  '28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36';
const PUBLIC_KEY = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY);

const balances1 = [];

let boxId = 'box';
let boxRecipientId = '';
let contractId = 'mytoken';
const main = async () => {
  balances1.push(await getBalance(PUBLIC_KEY));

  const data = await deployMaster(PRIVATE_KEY, PUBLIC_KEY);
  const masterRegistryUri = data.registryUri.replace('rho:id:', '');
  console.log('✓ 00 deploy master');

  const dataBox = await deployBox(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId
  );
  boxId = dataBox.boxId;
  boxRecipientId = dataBox.boxId;
  console.log('  Box ID : ' + boxId);

  balances1.push(await getBalance(PUBLIC_KEY));

  console.log('✓ 01 deploy box');
  console.log(
    '  01 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  const deployData = await deploy(
    PRIVATE_KEY,
    PUBLIC_KEY,
    masterRegistryUri,
    boxId,
    false,
    contractId,
    null
  );
  contractId = deployData.contractId;

  balances1.push(await getBalance(PUBLIC_KEY));
  console.log('✓ 02 deploy contract');
  console.log(
    '  02 dust cost: ' +
      (balances1[balances1.length - 2] - balances1[balances1.length - 1])
  );

  let lastDustCost;
  let firstDustCost;
  const createPursesBatch = async (j) => {
    const t = new Date().getTime();
    const ids = [];
    for (
      let i = 0;
      i < (j === 0 ? PURSES_TO_CREATE_INITIAL : PURSES_TO_CREATE);
      i += 1
    ) {
      ids.push(getRandomName());
    }

    if (NEW_BOX_EACH_TIME && j !== 0) {
      const dataBox = await deployBox(PRIVATE_KEY, PUBLIC_KEY, masterRegistryUri, 'recipient' + j);
      boxRecipientId = dataBox.boxId;
      balances1.push(await getBalance(PUBLIC_KEY));
    }

    await createPurses(
      PRIVATE_KEY,
      PUBLIC_KEY,
      masterRegistryUri,
      contractId,
      boxId,
      boxRecipientId,
      ids
    );
    balances1.push(await getBalance(PUBLIC_KEY));
    console.log('✓ 03 create purses');
    console.log(
      '  03 dust cost: ' +
        (balances1[balances1.length - 2] - balances1[balances1.length - 1])
    );

    if (NEW_BOX_EACH_TIME) {
      await checkPursesInBox(masterRegistryUri, boxRecipientId, contractId, ids);
    }
    const dustCost =
      balances1[balances1.length - 2] - balances1[balances1.length - 1];
    if (j === 0) {
      firstDustCost = dustCost;
    }
    const dustCostDiff = lastDustCost ? dustCost - lastDustCost : 0;
    lastDustCost = dustCost;

    const a = (dustCost / firstDustCost) * 100 - 100;
    const dustCostDiffFirst = Math.round(a * 100) / 100;
    let s = '';
    s += `✓ ${j} create ${
      j === 0 ? PURSES_TO_CREATE_INITIAL : PURSES_TO_CREATE
    } purses\n`;
    s += `  ${j} dust cost: ${dustCost} dust diff with prec: ${dustCostDiff}, dust diff with first: ${
      dustCostDiffFirst > 0 ? '+' + dustCostDiffFirst : dustCostDiffFirst
    }%\n`;
    s +=
      `  ${j} avg time of deploy+propose : ` +
      (new Date().getTime() - t) / 1000 +
      's\n';

    return s;
  };

  const time = (new Date().getTime() + '').slice(0, 10);
  const filename = `./stresslogs/stress_create_purses_logs_${time}.txt`;

  for (let j = 0; j < 1000000; j += 1) {
    if (j === 0) {
      fs.writeFileSync(
        filename,
        `CREATE_PURSES\nPURSES_TO_CREATE: ${PURSES_TO_CREATE}\nPURSES_TO_CREATE_INITIAL: ${PURSES_TO_CREATE_INITIAL}\nNEW_BOX_EACH_TIME: ${NEW_BOX_EACH_TIME}\nHOST=${process.env.VALIDATOR_HOST}\n`,
        'utf8'
      );
    }
    const res = await createPursesBatch(j);
    let s = '';
    if (j === 0) {
      s += `MASTER_REGISTRY_URI=${masterRegistryUri}\n`;
    }
    s += '  ' + new Date().toString() + '\n';
    '  batch no ' +
      j +
      ' will create (current: ' +
      (j + 1) * PURSES_TO_CREATE +
      ') + ' +
      PURSES_TO_CREATE +
      ' purses\n';

    let logs = '';
    try {
      logs = fs.readFileSync(filename, 'utf8');
    } catch (e) {}
    fs.writeFileSync(filename, logs + s + res, 'utf8');
  }
};

main();
