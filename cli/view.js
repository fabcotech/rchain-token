const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');
const path = require('path');

const {
  read,
  readBagsTerm,
} = require('../src');
const {
  getProcessArgv,
  getRegistryUri,
  logData,
} = require('./utils');

module.exports.view = async () => {
  const bagId = getProcessArgv('--bag');
  const registryUri = getRegistryUri();
  const term1 = read(registryUri);
  const term2 = readBagsTerm(registryUri);
  Promise.all(
    [rchainToolkit.http.exploreDeploy(
      process.env.READ_ONLY_HOST,
      {
        term: term1
      }
    ),
    rchainToolkit.http.exploreDeploy(
      process.env.READ_ONLY_HOST,
      {
        term: term2
      }
    )]
  ).then(results => {
    const data = rchainToolkit.utils.rhoValToJs(
      JSON.parse(results[0]).expr[0]
    );
    
    const bags = rchainToolkit.utils.rhoValToJs(
      JSON.parse(results[1]).expr[0]
    );
    console.log(logData(data));
    if (Object.keys(bags).length === 0) {
      console.log('\n no bags');
      return;
    }

    if (bagId !== undefined) {
      if (!bags[bagId]) {
        console.log('Bag ID ' + bagId + ' not found');
        return;
      }
      console.log('\n bag ID ' + bagId + '\n');
      console.log(` Public key : ${bags[bagId].publicKey}`);
      console.log(` Bag nonce  : ${bags[bagId].nonce}`);
      console.log(` Token ID   : ${bags[bagId].n}`);
      console.log(` Quantity   : ${bags[bagId].quantity}`);
      console.log(` Price      : ${bags[bagId].price || 'not for sale'}`);
      return;
    }
    const registryUri = data.registryUri.replace('rho:id:', '');
    console.log('\n bag ID   token ID   owner         quantity   price (dust) \n');
    Object.keys(bags).forEach(bagId => {
      let s = ' ';
      s += bagId;
      s = s.padEnd(10, ' ');
      s+= bags[bagId].n;
      s = s.padEnd(21, ' ');
      s+= bags[bagId].publicKey.slice(0,9) + '...';
      s = s.padEnd(35, ' ');
      s+= bags[bagId].quantity;
      s = s.padEnd(46, ' ');
      s+= bags[bagId].price || 'not for sale';
      console.log(s)
    });
    fs.writeFileSync(path.join(`./bags-${registryUri}.json`), JSON.stringify(bags, null, 2));
    console.log(`\n✓ wrote bags-${registryUri}.json file`);
  });
}