const rchainToolkit = require('@fabcotech/rchain-toolkit');
const fs = require('fs');
const { createPurse } = require('./api');

const {
  getBoxId,
  getQuantity,
  getContractId,
  getMasterRegistryUri,
  getNewId,
  getPrice,
  getPursesFile,
  log,
} = require('./utils');

const getPursesAndData = () => {
  const boxId = getBoxId();
  const pursesFileContent = getPursesFile()
    ? fs.readFileSync(getPursesFile(), 'utf8')
    : '';

  if (pursesFileContent !== '') {
    const pursesJSON = JSON.parse(pursesFileContent);

    const pursesData = Object.fromEntries(
      Object.entries(pursesJSON).map(([id, purse]) => [id, purse.data])
    );

    const purses = Object.fromEntries(
      Object.entries(pursesJSON).map(([id, purse]) => {
        delete purse.data;
        purse.boxId = boxId;
        purse.price = null;
        return [id, purse];
      })
    );

    return [purses, pursesData];
  }

<<<<<<< HEAD
  const quantity = getQuantity();

  if (!quantity) {
    throw new Error('Please provide a quantity with --quantity option');
  }

  return [
    {
      [`purse1`]: {
        id: getNewId() || '', // will be ignored if fungible = true
        price: null, 
        boxId,
        quantity
      },
    },
    {
      [`purse1`]: null,
=======
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
>>>>>>> 3e91e12 (rchain-toolkit -> @fabcotech/rchain-toolkit@2.0.0)
    },
  ];
};

const execCreatePurse = async () => {
  log('Make sure the private key provided is the one of the contract');
  log('Make sure the contract is not locked');

  const masterRegistryUri = getMasterRegistryUri();
  const contractId = getContractId();

  const [purses, pursesData] = getPursesAndData();

<<<<<<< HEAD
  const rPurseId = await createPurse({
    masterRegistryUri,
    validatorHost: process.env.VALIDATOR_HOST,
    privateKey: process.env.PRIVATE_KEY,
    contractId,
    purses,
    pursesData,
  });

  log(`Purse ${rPurseId} deployed`);
};

module.exports = {
  execCreatePurse,
=======
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
>>>>>>> 3e91e12 (rchain-toolkit -> @fabcotech/rchain-toolkit@2.0.0)
};
