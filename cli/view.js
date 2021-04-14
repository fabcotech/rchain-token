const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');
const path = require('path');

const {
  readTerm,
  readPursesTerm,
  readAllPursesTerm,
  readPursesIdsTerm,
} = require('../src');
const { getProcessArgv, getRegistryUri, logData } = require('./utils');

module.exports.view = async () => {
  const purseId = getProcessArgv('--purse');
  const registryUri = getRegistryUri();

  let term1 = undefined;
  let purses = {};
  if (purseId === undefined) {
    term1 = readAllPursesTerm(contractRegistryUri, {});
    const result1 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
      term: term1,
    });
    rc.utils.rhoValToJs(JSON.parse(result1).expr[0]).forEach((p) => {
      purses[p.id] = p;
    });
  } else {
    term1 = readPursesTerm(registryUri, {
      pursesIds: [purseId],
    });
    const result1 = await rchainToolkit.http.exploreDeploy(
      process.env.READ_ONLY_HOST,
      {
        term: term1,
      }
    );
    purses = rc.utils.rhoValToJs(JSON.parse(result1));
  }
  console.log(purses);
  return;

  const term1 = readTerm(registryUri);
  const term2 = readPursesTerm(registryUri, {
    pursesIds: purseId === undefined ? ids.slice(0, 100) : [purseId],
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

    const purses =
      ids.length > 0
        ? rchainToolkit.utils.rhoValToJs(JSON.parse(results[1]).expr[0])
        : [];
    logData(data);
    if (Object.keys(purses).length === 0) {
      console.log('\n no purses');
      return;
    }

    if (purseId !== undefined) {
      if (!purses[purseId]) {
        console.log('Purse ID ' + purseId + ' not found');
        return;
      }
      console.log('\n purse ID ' + purseId + '\n');
      console.log(` Public key : ${purses[purseId].publicKey}`);
      console.log(` Box        : ${purses[purseId].box}`);
      console.log(` Type       : ${purses[purseId].type}`);
      console.log(` Quantity   : ${purses[purseId].quantity}`);
      console.log(` Price      : ${purses[purseId].price || 'not for sale'}`);
      return;
    }
    const registryUri = data.registryUri.replace('rho:id:', '');
    console.log(
      `\n Purses [0-99] / ${ids.length}\n purse ID          type       box           owner         quantity         price (dust) \n`
    );
    Object.keys(purses).forEach((bagId) => {
      let s = '';
      s += bagId;
      s = s.padEnd(18, ' ');
      s += purses[bagId].type;
      s = s.padEnd(29, ' ');
      s += purses[bagId].box.replace('rho:id:', '').slice(0, 8) + '...';
      s = s.padEnd(43, ' ');
      s += purses[bagId].publicKey.slice(0, 8) + '...';
      s = s.padEnd(57, ' ');
      s += purses[bagId].quantity;
      s = s.padEnd(74, ' ');
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
      path.join(`./purses-${registryUri}.json`),
      JSON.stringify(purses, null, 2)
    );
    console.log('\x1b[0m', `\n✓ wrote purses-${registryUri}.json file`);
  });
};
