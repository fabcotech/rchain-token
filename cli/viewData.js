const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');

const { getProcessArgv, getRegistryUri } = require('./utils');
const { readPursesDataTerm } = require('../src');

module.exports.viewData = async () => {
  const purseId = getProcessArgv('--purse');
  const tokenId = getProcessArgv('--token');
  const registryUri = getRegistryUri();

  if (typeof purseId === 'undefined' && typeof tokenId === 'undefined') {
    console.log('Please provide one of options --purse or --token');
    process.exit();
  }

  rchainToolkit.http
    .exploreDeploy(process.env.READ_ONLY_HOST, {
      term: readPursesDataTerm(registryUri, { pursesIds: [purseId] }),
    })
    .then((results) => {
      let data = rchainToolkit.utils.rhoValToJs(JSON.parse(results).expr[0]);
      console.log(data);
      data = decodeURI(data[tokenId || purseId]);

      let fileName = `./data-token-${tokenId}.txt`;
      if (purseId) {
        fileName = `./data-purse-${purseId}.txt`;
      }
      console.log(
        `✓ retrieved data associated with ${
          tokenId ? 'token' : 'data-purse'
        } ${purseId} :`
      );
      if (typeof data === 'string') {
        console.log(data.slice(0, 20) + '...');
      }
      fs.writeFileSync(fileName, data, 'utf8');
      console.log(`✓ wrote ${fileName} file`);
    });
};
