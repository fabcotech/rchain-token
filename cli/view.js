const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');
const path = require('path');

const { readTerm, readPursesTerm, readPursesIdsTerm } = require('../src');
const { getProcessArgv, getRegistryUri, logData } = require('./utils');

module.exports.view = async () => {
  const purseId = getProcessArgv('--purse');
  const registryUri = getRegistryUri();

  const term0 = readPursesIdsTerm(registryUri);
  const result0 = await rchainToolkit.http.exploreDeploy(
    process.env.READ_ONLY_HOST,
    {
      term: term0,
    }
  );
  let ids = [];
  if (purseId === undefined) {
    ids = rchainToolkit.utils.rhoValToJs(JSON.parse(result0).expr[0]);
  }

  const term1 = readTerm(registryUri);
  const term2 = readPursesTerm(registryUri, {
    pursesIds: purseId === undefined ? ids.slice(0, 99) : [purseId],
  });
  const publicKey = process.env.PRIVATE_KEY
    ? rchainToolkit.utils.publicKeyFromPrivateKey(process.env.PRIVATE_KEY)
    : 'é';

  const t = new Date().getTime();
  Promise.all([
    rchainToolkit.http.exploreDeploy(process.env.READ_ONLY_HOST, {
      term: term1,
    }),
    rchainToolkit.http.exploreDeploy(process.env.READ_ONLY_HOST, {
      term: term2,
    }),
  ]).then((results) => {
    const data = rchainToolkit.utils.rhoValToJs(JSON.parse(results[0]).expr[0]);

    const purses = rchainToolkit.utils.rhoValToJs(
      JSON.parse(results[1]).expr[0]
    );
    logData(data);
    if (Object.keys(purses).length === 0) {
      console.log('\n no bags');
      return;
    }

    if (purseId !== undefined) {
      if (!purses[purseId]) {
        console.log('Purse ID ' + purseId + ' not found');
        return;
      }
      console.log('\n purse ID ' + purseId + '\n');
      console.log(` Public key : ${purses[purseId].publicKey}`);
      console.log(` Type   : ${purses[purseId].type}`);
      console.log(` Quantity   : ${purses[purseId].quantity}`);
      console.log(` Price      : ${purses[purseId].price || 'not for sale'}`);
      return;
    }
    const registryUri = data.registryUri.replace('rho:id:', '');
    console.log(
      '\n Bags [0-99]\n bag ID            type       owner         quantity           price (dust) \n'
    );
    Object.keys(purses).forEach((bagId) => {
      let s = '';
      s += bagId;
      s = s.padEnd(18, ' ');
      s += purses[bagId].type;
      s = s.padEnd(29, ' ');
      s += purses[bagId].publicKey.slice(0, 9) + '...';
      s = s.padEnd(43, ' ');
      s += purses[bagId].quantity;
      s = s.padEnd(62, ' ');
      s +=
        typeof purses[bagId].price === 'number'
          ? purses[bagId].price
          : 'not for sale';
      if (purses[bagId].publicKey === publicKey) {
        console.log('\x1b[32m', s);
      } else {
        console.log('\x1b[0m', s);
      }
    });
    fs.writeFileSync(
      path.join(`./bags-${registryUri}.json`),
      JSON.stringify(purses, null, 2)
    );
    console.log('\x1b[0m', `\n✓ wrote bags-${registryUri}.json file`);
  });
};
