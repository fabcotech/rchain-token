const { updatePursePrice } = require('./api')

const {
  log,
  getBoxId,
  getContractId,
  getMasterRegistryUri,
  getProcessArgv,
} = require('./utils');

const getPrice =  () => {
  let price = getProcessArgv('--price');
  const match = price.match(/^(\w+),(\w+)$/);
  if (!match) {
    throw new Error('Could not parse --price, must be format x01mynft,purse0 for NFT sell order and x01mytoken,1 for FT sell order');
  }
  const [, currency, amount] = match;
  return [
    currency,
    amount
  ];
}

const execUpdatePursePrice= async () => {
  const masterRegistryUri = getMasterRegistryUri();
  const contractId = getContractId();
  const boxId = getBoxId();

  const purseId = getProcessArgv('--purse-id');
  if (typeof purseId !== "string") {
    throw new Error('Missing arguments --purse-id');
  }

  await updatePursePrice({
    masterRegistryUri,
    validatorHost: process.env.VALIDATOR_HOST,
    privateKey: process.env.PRIVATE_KEY,
    shardId: process.env.SHARD_ID,
    contractId,
    boxId,
    purseId,
    price: getPrice(),
  });

  log('✓ Price updated');
};

module.exports = {
  execUpdatePursePrice
}