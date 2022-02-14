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
    },
  ];
};

const execCreatePurse = async () => {
  log('Make sure the private key provided is the one of the contract');
  log('Make sure the contract is not locked');

  const masterRegistryUri = getMasterRegistryUri();
  const contractId = getContractId();

  const [purses, pursesData] = getPursesAndData();

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
};
