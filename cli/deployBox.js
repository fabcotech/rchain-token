const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');

const { boxTerm } = require('../src/');

const { log, validAfterBlockNumber, prepareDeploy } = require('./utils');

module.exports.deployBox = async () => {
  if (typeof process.env.BOX_NAME === 'string') {
    console.log('Please remove BOX_NAME=* line in .env file');
    process.exit();
  }
  if (typeof process.env.BOX_REGISTRY_URI === 'string') {
    console.log('Please remove BOX_REGISTRY_URI=* line in .env file');
    process.exit();
  }
  const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(
    process.env.PRIVATE_KEY
  );
  const timestamp = new Date().getTime();
  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const pd = await prepareDeploy(
    process.env.READ_ONLY_HOST,
    publicKey,
    timestamp
  );

  const term = boxTerm({ publicKey: publicKey });
  log('✓ prepare deploy');

  const deployOptions = await rchainToolkit.utils.getDeployOptions(
    'secp256k1',
    timestamp,
    term,
    process.env.PRIVATE_KEY,
    publicKey,
    1,
    1000000,
    vab || -1
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
  log('✓ deploy');

  let dataAtNameResponse;
  try {
    dataAtNameResponse = await new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        try {
          rchainToolkit.http
            .dataAtName(process.env.VALIDATOR_HOST, {
              name: {
                UnforgPrivate: { data: JSON.parse(pd).names[0] },
              },
              depth: 3,
            })
            .then((dataAtNameResponse) => {
              if (
                dataAtNameResponse &&
                JSON.parse(dataAtNameResponse) &&
                JSON.parse(dataAtNameResponse).exprs &&
                JSON.parse(dataAtNameResponse).exprs.length
              ) {
                resolve(dataAtNameResponse);
                clearInterval(interval);
              } else {
                log('.');
              }
            })
            .catch((err) => {
              log(
                'Cannot retreive transaction data, will try again in 15 seconds'
              );
              console.log(err);
              process.exit();
            });
        } catch (err) {
          log('Cannot retreive transaction data, will try again in 15 seconds');
          console.log(err);
          process.exit();
        }
      }, 15000);
    });
  } catch (err) {
    log('Failed to parse dataAtName response', 'error');
    console.log(err);
    process.exit();
  }
  const data = rchainToolkit.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );
  let envText = fs.readFileSync('./.env', 'utf8');
  const boxRegstryUri = data.registryUri.replace('rho:id:', '');
  envText += `\BOX_REGISTRY_URI=${boxRegstryUri}`;
  fs.writeFileSync('./.env', envText, 'utf8');
  log('✓ deployed and retrieved data from the blockchain');
  log(`✓ updated .env file with BOX_REGISTRY_URI=${boxRegstryUri}`);
  console.log(`Registry URI (box)    : ${boxRegstryUri}`);
};
