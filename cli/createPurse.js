const rchainToolkit = require('@fabcotech/rchain-toolkit');
const fs = require('fs');

const { createPursesTerm } = require('../src');

const {
  getBoxId,
  getQuantity,
  getContractId,
  getMasterRegistryUri,
  getNewId,
  getPrice,
  getProcessArgv,
  log,
  getPursesFile,
} = require('./utils');

module.exports.createPurse = async () => {
  const masterRegistryUri = getMasterRegistryUri();
  const contractId = getContractId();
  log('Make sure the private key provided is the one of the contract');
  log('Make sure the contract is not locked');
  const boxId = getBoxId();

  const newId = getNewId();

  const pursesFile = getPursesFile()
    ? fs.readFileSync(getPursesFile(), 'utf8')
    : '';

  let quantity;
  if (pursesFile === '') {
    quantity = getQuantity();
    if (!quantity) {
      throw new Error('Please provide a quantity with --quantity option');
    }
  }

  let payload = {
    masterRegistryUri: masterRegistryUri,
    contractId: contractId,
    purses: {
      [newId || 'auto']: {
        id: newId || 'auto',
        price: null,
        boxId: boxId,
        quantity: quantity,
      },
    },
    data: {
      [newId || 'auto']: null,
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

  let dataAtNameResponse;
  try {
    dataAtNameResponse = await rchainToolkit.http.easyDeploy(
      process.env.VALIDATOR_HOST,
      {
        term,
        shardId: process.env.SHARD_ID,
        privateKey: process.env.PRIVATE_KEY,
        phloPrice: 'auto',
        phloLimit: 10000000,
        timeout: 10 * 60 * 1000
      }
    );
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
  log('✓ deploy');

  const data = rchainToolkit.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  if (data.status !== 'completed') {
    throw new Error(`Error, status: ${data.status}, message: ${data.message}`);
  }

  console.log(JSON.stringify(data.results, null, 2));
};
