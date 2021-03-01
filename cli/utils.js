const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');
const { blake2b } = require('blakejs');

const getProcessArgv = (param) => {
  const index = process.argv.findIndex((arg) => arg === param);
  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
};
module.exports.getProcessArgv = getProcessArgv;

module.exports.logData = (data) => {
  console.log(`Registry URI   : ${data.registryUri.replace('rho:id:', '')}`);
  if (data.fungible) {
    console.log(`Fungibility    :\x1b[36m`, 'fungible tokens', '\x1b[0m');
  } else {
    console.log(`Fungibility    :\x1b[36m`, 'non-fungible tokens', '\x1b[0m');
  }
  if (data.locked) {
    console.log(`Locked         : locked`, '\x1b[0m');
  } else {
    console.log('Locked         :\x1b[31m NOT LOCKED \x1b[0m');
  }
  console.log(`Version        : ${data.version}`);
};

module.exports.prepareDeploy = async (
  httpUrlReadOnly,
  publicKey,
  timestamp
) => {
  let prepareDeployResponse;
  try {
    prepareDeployResponse = await rchainToolkit.http.prepareDeploy(
      httpUrlReadOnly,
      {
        deployer: publicKey,
        timestamp: timestamp,
        nameQty: 1,
      }
    );
  } catch (err) {
    console.log(err);
    throw new Error('Unable to prepare deploy');
  }

  return prepareDeployResponse;
};

module.exports.validAfterBlockNumber = async (httpUrlReadOnly) => {
  let validAfterBlockNumberResponse;
  try {
    validAfterBlockNumberResponse = JSON.parse(
      await rchainToolkit.http.blocks(httpUrlReadOnly, {
        position: 1,
      })
    )[0].blockNumber;
  } catch (err) {
    log('Unable to get last finalized block', 'error');
    console.log(err);
    throw new Error();
  }
  return validAfterBlockNumberResponse;
};

const log = (a, level = 'info') => {
  if (level === 'warning') {
    console.log('\x1b[33m%s\x1b[0m', new Date().toISOString() + ' [WARN] ' + a);
  } else if (level === 'error') {
    console.log(
      '\x1b[31m%s\x1b[0m',
      new Date().toISOString() + ' [ERROR] ' + a
    );
  } else {
    console.log(new Date().toISOString(), a);
  }
};
module.exports.log = log;

module.exports.generateSignature = (nonce, privateKey) => {
  const bufferToSign = Buffer.from(nonce, 'utf8');
  const uInt8Array = new Uint8Array(bufferToSign);
  const blake2bHash = blake2b(uInt8Array, 0, 32);
  const signature = rchainToolkit.utils.signSecp256k1(blake2bHash, privateKey);
  const signatureHex = Buffer.from(signature).toString('hex');

  return signatureHex;
};

module.exports.buildUnforgeableNameQuery = (unforgeableName) => {
  return {
    UnforgPrivate: { data: unforgeableName },
  };
};

// command line arguments

module.exports.getBagsFile = () => {
  return getProcessArgv('--bags-file');
};

module.exports.getType = () => {
  const type = getProcessArgv('--type');
  return type;
};

module.exports.getNewId = () => {
  const newId = getProcessArgv('--new-id');
  return newId;
};

module.exports.getNonce = () => {
  const nonce = getProcessArgv('--nonce');
  if (typeof nonce !== 'string') {
    throw new Error('Missing arguments --nonce');
  }
  return nonce;
};

module.exports.getContractNonce = () => {
  const nonce = getProcessArgv('--contract-nonce');
  if (typeof nonce !== 'string') {
    throw new Error('Missing arguments --contract-nonce');
  }
  return nonce;
};

module.exports.getPrice = () => {
  const price = getProcessArgv('--price')
    ? parseInt(getProcessArgv('--price'), 10)
    : undefined;
  if (typeof price !== 'number' || isNaN(price)) {
    throw new Error('Missing arguments --price');
  }
  return price;
};

module.exports.getQuantity = () => {
  const quantity = getProcessArgv('--quantity')
    ? parseInt(getProcessArgv('--quantity'), 10)
    : undefined;
  if (typeof quantity !== 'number' || isNaN(quantity)) {
    throw new Error('Missing arguments --quantity');
  }
  return quantity;
};

module.exports.getPublicKey = () => {
  const publicKey = getProcessArgv('--public-key');
  if (typeof publicKey !== 'string') {
    throw new Error('Missing arguments --public-key');
  }
  return publicKey;
};

module.exports.getFromBagId = () => {
  const bagId = getProcessArgv('--from-bag');
  if (!bagId) {
    throw new Error('Missing arguments --from-bag');
  }
  return bagId;
};

module.exports.getBoxRegistryUri = () => {
  let boxRegistryUri = process.env.BOX_REGISTRY_URI;
  if (typeof boxRegistryUri !== 'string' || boxRegistryUri.length === 0) {
    throw new Error('Missing arguments --box or BOX_NAME=* in .env file');
  }
  return boxRegistryUri;
};

module.exports.getFungible = () => {
  const fungible = getProcessArgv('--fungible');
  if (!['true', 'false'].includes(fungible)) {
    throw new Error('Missing arguments --fungible true/false');
  }
  return fungible === 'true';
};

module.exports.getNewBagId = () => {
  const bagId = getProcessArgv('--new-bag');
  if (!bagId) {
    throw new Error('Missing arguments --new-bag');
  }
  return bagId;
};

module.exports.getFile = () => {
  const path = getProcessArgv('--file');
  if (typeof path !== 'string' || !fs.existsSync(path)) {
    throw new Error('Missing arguments --file, or file does not exist');
  }
  const data = fs.readFileSync(path, 'utf8');
  return data;
};

module.exports.getRegistryUri = () => {
  let registryUri = getProcessArgv('--registry-uri');
  if (!registryUri) {
    registryUri = getProcessArgv('-r');
  }
  if (typeof registryUri !== 'string') {
    registryUri = process.env.REGISTRY_URI;
  }
  if (typeof registryUri !== 'string' || registryUri.length === 0) {
    throw new Error(
      'Missing arguments --registry-uri, or -r, or REGISTRY_URI=* in .env file'
    );
  }
  return registryUri;
};
