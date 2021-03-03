const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');

const { createPursesTerm } = require('../src');

const {
  getBoxRegistryUri,
  getQuantity,
  getRegistryUri,
  getType,
  getNewId,
  log,
  validAfterBlockNumber,
  getPursesFile,
} = require('./utils');

module.exports.createPurse = async () => {
  log(
    'Make sure the private key provided is the one of the contract owner (initial deploy)'
  );
  log('Make sure the contract is not locked');
  const registryUri = getRegistryUri();
  const boxRegistryUri = getBoxRegistryUri();
  const type = getType();
  if (!type) {
    throw new Error('Please provide a type with --type option');
  }
  const newId = getNewId();
  if (!newId) {
    console.log(
      'No --new-id option found. If your contract deals with non-fungible, please provide a --new-id'
    );
  }
  const quantity = getQuantity();

  const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(
    process.env.PRIVATE_KEY
  );
  let payload = {
    purses: {
      [`newbag1`]: {
        id: newId || '', // will be ignored if fungible = true
        type: type,
        publicKey: publicKey,
        quantity: quantity,
      },
    },
    data: {
      [`newbag1`]: null,
    },
    fromBoxRegistryUri: boxRegistryUri,
  };

  const pursesFile = getPursesFile()
    ? fs.readFileSync(getPursesFile(), 'utf8')
    : '';
  const defaultPursesData = {};
  const defaultPurses = {};

  if (pursesFile) {
    const bags = JSON.parse(pursesFile);
    Object.keys(bags).forEach((purseId) => {
      defaultPursesData[purseId] = bags[purseId].data;
      delete bags[purseId].data;
      defaultPurses[purseId] = bags[purseId];
      defaultPurses[purseId].publicKey = publicKey;
    });
    log(Object.keys(defaultPurses).length + ' purse found in json file');
    log(
      Object.keys(defaultPursesData).length + ' purse data found in json file'
    );
    payload = {
      purses: defaultPurses,
      data: defaultPursesData,
      fromBoxRegistryUri: boxRegistryUri,
    };
  }

  const term = createPursesTerm(registryUri, payload);

  const timestamp = new Date().getTime();
  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const deployOptions = await rchainToolkit.utils.getDeployOptions(
    'secp256k1',
    timestamp,
    term,
    process.env.PRIVATE_KEY,
    publicKey,
    1,
    10000000,
    vab
  );

  try {
    const deployResponse = await rchainToolkit.http.deploy(
      process.env.VALIDATOR_HOST,
      deployOptions
    );
    if (!deployResponse.startsWith('"Success!')) {
      log('Unable to deploy');
      console.log(deployResponse);
      process.exit();
    }
  } catch (err) {
    log('Unable to deploy');
    console.log(err);
    process.exit();
  }
  log('✓ deployed');
};
