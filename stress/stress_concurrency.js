const rc = require('@fabcotech/rchain-toolkit');
const fs = require('fs');

require('dotenv').config();

const deployBox = require('../tests-ft/test_deployBox').main;
const deployMaster = require('../tests-ft/test_deployMaster').main;
const deploy = require('../tests-ft/test_deploy').main;

const createPurses = require('./test_createPurses.js').main;

const CONCURRENT_ACTIONS = 6;

const PRIVATE_KEY =
  '28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36';
const PUBLIC_KEY = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY);

const PRIVATE_KEY_2 =
  'a2803d16030f83757a5043e5c0e28573685f6d8bf4e358bf1385d82bffa8e698';
const PRIVATE_KEY_3 =
  '102e5bdaf36a6fd514c1e19c1b03d25c82c90a47934b51c5514e1498e16ea91';
const PRIVATE_KEY_4 =
  '45ef855785a9e119b580178d49982bca7730142f1fa3d647f203e5a59a4e413b';
const PRIVATE_KEY_5 =
  'a3b8cf57a62fbf9b96b1f4cefdef30eda4b2e05fcf554d209858bd1cbe7d9df0';
const PRIVATE_KEY_6 =
  '4cc1a73f623f2bf488032dd3c0900eaa5f29d0eb53dbf3d74be193e3b18d7bae';
const PRIVATE_KEY_7 =
  '3e90374bfd00d3b97c82038593f30e271512cda300ebf5fce08ec4a8eefc1fe5';
const PRIVATE_KEY_8 =
  '9337ce9b3c9a883b1eba9c883564869936dec433309d9103564ed891127f85c6';
const PRIVATE_KEY_9 =
  '38e68976cd641ab3fdde22a46b5e9bdd65e45cd496a28c85dc424f530b56b5df';
const PRIVATE_KEY_10 =
  '2f1b6967c3fe95b698ac11be0b7356252cd4bc2847682bd45f3c319cd6ab5982';
const PRIVATE_KEY_11 =
  '742a8f46146a03f54d9f3bcb420f45c6e1fe8975ee0e9062158f6966cb4064f7';
const PRIVATE_KEYS = [
  PRIVATE_KEY,
  PRIVATE_KEY_2,
  PRIVATE_KEY_3,
  PRIVATE_KEY_4,
  PRIVATE_KEY_5,
  PRIVATE_KEY_6,
  PRIVATE_KEY_7,
  PRIVATE_KEY_8,
  PRIVATE_KEY_9,
  PRIVATE_KEY_10,
  PRIVATE_KEY_11,
].slice(0, CONCURRENT_ACTIONS);

let bonds = ``;
PRIVATE_KEYS.forEach((pk) => {
  bonds +=
    '\n' +
    rc.utils.revAddressFromPublicKey(rc.utils.publicKeyFromPrivateKey(pk)) +
    ',1000000000000000,0';
});
console.log('add this to your bonds.txt ');
console.log(bonds);

const main = async () => {
  const time = (new Date().getTime() + '').slice(0, 10);
  const filename = `./stresslogs/stress_concurrency_logs_${time}.txt`;
  const data = await deployMaster(PRIVATE_KEY, PUBLIC_KEY);
  const masterRegistryUri = data.registryUri.replace('rho:id:', '');

  let logs = `CONCURRENT_ACTIONS:${CONCURRENT_ACTIONS}\n`;

  const t = new Date().getTime();
  const boxes = await Promise.all(
    PRIVATE_KEYS.map((pk, i) => {
      return deployBox(
        pk,
        rc.utils.publicKeyFromPrivateKey(pk),
        masterRegistryUri,
        'box' + i
      );
    })
  );
  console.log(boxes);
  console.log('✓ deploy boxes');

  const a =
    `avg time of deploying boxes : ` + (new Date().getTime() - t) / 1000 + 's';
  console.log(a);
  logs += a + '\n';

  const t2 = new Date().getTime();
  const contracts = await Promise.all(
    PRIVATE_KEYS.map((pk, i) => {
      return deploy(
        pk,
        rc.utils.publicKeyFromPrivateKey(pk),
        masterRegistryUri,
        'box' + i,
        false,
        'mytoken' + i,
        null
      );
    })
  );
  console.log(contracts);
  console.log('✓ deploy contracts');

  const b =
    `avg time of deploying contracts : ` +
    (new Date().getTime() - t2) / 1000 +
    's';
  console.log(b);
  logs += b + '\n';

  const t3 = new Date().getTime();
  const createPursess = await Promise.all(
    PRIVATE_KEYS.map((pk, i) => {
      return createPurses(
        pk,
        rc.utils.publicKeyFromPrivateKey(pk),
        masterRegistryUri,
        'mytoken' + i,
        'box' + i,
        'box' + i,
        ['aaa']
      );
    })
  );

  console.log(createPursess);
  console.log('✓ deploy create purses');

  const c =
    `avg time of creating purses : ` + (new Date().getTime() - t3) / 1000 + 's';
  console.log(c);
  logs += c + '\n';

  fs.writeFileSync(filename, logs, 'utf8');
};

main();
