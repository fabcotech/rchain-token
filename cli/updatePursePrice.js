const rchainToolkit = require('@fabcotech/rchain-toolkit');
const uuidv4 = require('uuid/v4');

const { updatePursePriceTerm } = require('../src');

const {
  log,
  validAfterBlockNumber,
  getBoxId,
  getContractId,
  getMasterRegistryUri,
  getProcessArgv,
} = require('./utils');

module.exports.updatePursePrice = async () => {
  const masterRegistryUri = getMasterRegistryUri();
  const contractId = getContractId();
  const boxId = getBoxId();

  const purseId = getProcessArgv('--purse-id');
  if (typeof purseId !== "string") {
    throw new Error('Missing arguments --purse-id');
  }

  let price = getProcessArgv('--price')
  if (price === "null" || price === "0") {
    price = null;
  } else {
    try {
      price = JSON.parse(`{ "a": ${price} }`).a
      // NFT sell order
      if (
        typeof price[0] === "string" &&
        typeof price[1] === "string" && 
        price[0].length > 1 &&
        price[1].length > 1
      ) {
        price = ['"' + price[0] + '"', price[1]]
      // FT sell order
      } else if (
        typeof price[0] === "string" &&
        typeof price[1] === "number" && 
        price[0].length > 1 &&
        !isNaN(price[1]) &&
        price[1] !== 0
      ) {
        price = ['"' + price[0] + '"', price[1]]
      } else {
        throw new Error()
      }
    } catch (err) {
      throw new Error('Could not parse --price, must be format [\\"x01mynft\\", "purse0"] for NFT sell order and [\\"x01mytoken\\", 1] for FT sell order')
    }
  }

  // auto add prefix
  if (price[0] === '"rev"') {
    price[0] = `"${masterRegistryUri.slice(0,3)}rev"`
  }

  const term = updatePursePriceTerm({ masterRegistryUri, boxId, contractId, price, purseId });
  let deployResponse;
  try {
    deployResponse = await rchainToolkit.http.easyDeploy(
      process.env.VALIDATOR_HOST,
      {
        term,
        shardId: process.env.SHARD_ID,
        privateKey: process.env.PRIVATE_KEY,
        phloPrice: 'auto',
        phloLimit: 10000000,
      }
    );
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
  if (!deployResponse.startsWith('"Success!')) {
    log('Unable to deploy');
    console.log(deployResponse);
    process.exit();
  }
  log('✓ deployed');
};
