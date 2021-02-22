const rchainToolkit = require('rchain-toolkit');
const uuidv4 = require('uuid/v4');
const fs = require('fs');

const { mainTerm } = require('../src/');

const {
  log,
  validAfterBlockNumber,
  prepareDeploy,
  logData,
  getBagsFile,
} = require('./utils');

module.exports.deploy = async () => {
  if (typeof process.env.REGISTRY_URI === 'string') {
    console.log('Please remove REGISTRY_URI=* line in .env file');
    process.exit();
  }
  const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(
    process.env.PRIVATE_KEY
  );
  const newNonce = uuidv4().replace(/-/g, '');
  const timestamp = new Date().getTime();
  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const pd = await prepareDeploy(
    process.env.READ_ONLY_HOST,
    publicKey,
    timestamp
  );
  const bagsFile = getBagsFile() ? fs.readFileSync(getBagsFile(), 'utf8') : '';
  const defaultBagsData = {};
  const defaultBags = {};

  let defaultBagsIdsRholang = '';
  let defaultBagsRholang = '';
  let defaultBagsDataRholang = '';
  if (bagsFile) {
    const bags = JSON.parse(bagsFile);
    Object.keys(bags).forEach((bagId) => {
      defaultBagsData[bagId] = bags[bagId].data;
      delete bags[bagId].data;
      defaultBags[bagId] = bags[bagId];
    });
    log(Object.keys(defaultBags).length + ' bags found in json file');
    log(Object.keys(defaultBagsData).length + ' bags data found in json file');

    defaultBagsIdsRholang = 'for (ids <- bagsIds) { bagsIds!(Set(';
    defaultBagsIdsRholang += Object.keys(defaultBags)
      .map((a) => `"${a}"`)
      .join(',');
    defaultBagsIdsRholang += ')) } |';

    Object.keys(defaultBags).forEach((id) => {
      defaultBagsRholang += `@(*bags, "${id}")!(${JSON.stringify(
        defaultBags[id]
      ).replace(new RegExp(': null|:null', 'g'), ': Nil')}) |\n`;
    });

    Object.keys(defaultBags).forEach((id) => {
      let data = 'Nil';
      if (
        (typeof defaultBagsData[id] === 'object' ||
          typeof defaultBagsData[id] === 'function') &&
        defaultBagsData[id] !== null
      ) {
        data = JSON.stringify(defaultBagsData[id]).replace(
          new RegExp(': null|:null', 'g'),
          ': Nil'
        );
      } else if (defaultBagsData[id]) {
        data = `"${defaultBagsData[id]}"`;
      }
      defaultBagsDataRholang += `@(*bagsData, "${id}")!(${data}) |\n`;
    });
  }

  const term = mainTerm(newNonce, publicKey)
    .replace('/*DEFAULT_BAGS_IDS*/', defaultBagsIdsRholang)
    .replace('/*DEFAULT_BAGS*/', defaultBagsRholang)
    .replace('/*DEFAULT_BAGS_DATA*/', defaultBagsDataRholang);

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
                log(
                  'Did not find transaction data, will try again in 15 seconds'
                );
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
  envText += `\nREGISTRY_URI=${data.registryUri.replace('rho:id:', '')}`;
  fs.writeFileSync('./.env', envText, 'utf8');
  log('✓ deployed and retrieved data from the blockchain');
  log(
    `✓ updated .env file with REGISTRY_URI=${data.registryUri.replace(
      'rho:id:',
      ''
    )}`
  );
  logData(data);
};
