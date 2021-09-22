const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');

const { createPursesTerm } = require('../src');

const {
  getBoxId,
  getQuantity,
  getContractId,
  getMasterRegistryUri,
  getNewId,
  getPrice,
  log,
  validAfterBlockNumber,
  getPursesFile,
} = require('./utils');

module.exports.createPurse = async () => {
  const masterRegistryUri = getMasterRegistryUri();
  const contractId = getContractId();
  log('Make sure the private key provided is the one of the contract');
  log('Make sure the contract is not locked');
  const boxId = getBoxId();

  const newId = getNewId();

  const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(
    process.env.PRIVATE_KEY
  );

  const pursesFile = getPursesFile()
    ? fs.readFileSync(getPursesFile(), 'utf8')
    : '';

  let quantity;
  let price;
  if (pursesFile === '') {
    quantity = getQuantity();
    price = getPrice();
    if (!quantity) {
      throw new Error('Please provide a quantity with --quantity option');
    }
  }
  let payload = {
    masterRegistryUri: masterRegistryUri,
    contractId: contractId,
    purses: {
      [`newbag1`]: {
        id: newId || '', // will be ignored if fungible = true
        price: price,
        boxId: boxId,
        quantity: quantity,
      },
    },
    data: {
      [`newbag1`]: null,
    },
  };

  const defaultPursesData = {};
  const defaultPurses = {};

  if (pursesFile) {
    const purses = JSON.parse(pursesFile);
    Object.keys(purses).forEach((purseId) => {
      defaultPursesData[purseId] = purses[purseId].data;
      delete purses[purseId].data;
      defaultPurses[purseId] = purses[purseId];
      defaultPurses[purseId].boxId = boxId;
      defaultPurses[purseId].price = null;
    });
    log(Object.keys(defaultPurses).length + ' purse found in json file');
    log(
      Object.keys(defaultPursesData).length + ' purse data found in json file'
    );
    payload = {
      masterRegistryUri: masterRegistryUri,
      contractId: contractId,
      purses: defaultPurses,
      data: defaultPursesData,
    };
  }

  const term = createPursesTerm(payload);

  const timestamp = new Date().getTime();
  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const deployOptions = await rchainToolkit.utils.getDeployOptions(
    'secp256k1',
    timestamp,
    term,
    process.env.PRIVATE_KEY,
    publicKey,
    1,
    100000000,
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
