const fs = require('fs');
const { deployBox } = require('./api');

const { log, getMasterRegistryUri, getProcessArgv } = require('./utils');

const execDeployBox = async () => {
  if (typeof process.env.BOX_ID === 'string') {
    console.log('Please remove BOX_ID=* line in .env file');
    process.exit();
  }

  const masterRegistryUri = getMasterRegistryUri();
  const boxId = getProcessArgv('--box-id');
  if (!boxId || boxId.length === 0) {
    throw new Error('Missing arguments --box-id');
  }

  const rBoxId = await deployBox({
    shardId: process.env.SHARD_ID,
    validatorHost: process.env.VALIDATOR_HOST,
    masterRegistryUri,
    boxId,
    privateKey: process.env.PRIVATE_KEY,
  });

  let envText = fs.readFileSync('./.env', 'utf8');
  envText += `\nBOX_ID=${rBoxId}`;
  fs.writeFileSync('./.env', envText, 'utf8');
  log('✓ deployed and retrieved data from the blockchain');
  log(`✓ updated .env file with BOX_ID=${rBoxId}`);
  log(`box id    : ${rBoxId}`);
};

module.exports = {
  execDeployBox,
};
