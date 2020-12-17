const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');

const { getProcessArgv, getRegistryUri } = require('./utils');
const { readBagOrTokenDataTerm } = require('../src');

module.exports.viewData = async () => {
  const bagId = getProcessArgv('--bag');
  const tokenId = getProcessArgv('--token');

  if (typeof bagId === 'undefined' && typeof tokenId === 'undefined') {
    console.log('Please provide one of options --bag or --token');
    process.exit();
  }

  const registryUri = getRegistryUri();
  rchainToolkit.http
    .exploreDeploy(process.env.READ_ONLY_HOST, {
      term: readBagOrTokenDataTerm(
        registryUri,
        tokenId ? 'tokens' : 'bags',
        tokenId || bagId
      ),
    })
    .then((results) => {
      let data = rchainToolkit.utils.rhoValToJs(JSON.parse(results).expr[0]);
      data = decodeURI(data);

      let fileName = `./token-${tokenId}-data.txt`;
      if (bagId) {
        fileName = `./bag-${bagId}-data.txt`;
      }
      console.log(
        `✓ retrieved data associated with ${tokenId ? 'token' : 'bag'} ${
          tokenId || bagId
        } :`
      );
      if (typeof data === 'string') {
        console.log(data.slice(0, 20) + '...');
      }
      fs.writeFileSync(fileName, data, 'utf8');
      console.log(`✓ wrote ${fileName} file`);
    });
};
