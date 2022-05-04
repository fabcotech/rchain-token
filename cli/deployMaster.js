const fs = require('fs');
const { deployMaster } = require('./api');

const { log } = require('./utils');

const execDeployMaster = async () => {
  if (typeof process.env.MASTER_REGISTRY_URI === 'string') {
    console.log('Please remove MASTER_REGISTRY_URI=* line in .env file');
    process.exit();
  }

  const masterRegistryURI = await deployMaster({
    validatorHost: process.env.VALIDATOR_HOST,
    shardId: process.env.SHARD_ID,
    privateKey: process.env.PRIVATE_KEY,
  });

  log('✓ deployed master and retrieved data from the blockchain');
  let envText = fs.readFileSync('./.env', 'utf8');
  envText += `\nMASTER_REGISTRY_URI=${masterRegistryURI}`;
  fs.writeFileSync('./.env', envText, 'utf8');
  log(`✓ updated .env file with MASTER_REGISTRY_URI=${masterRegistryURI}`);
};

module.exports = {
  execDeployMaster,
};
