const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');
const path = require('path');

const {
  readConfigTerm,
  readPursesTerm,
  readAllPursesTerm,
} = require('../src');
const { getProcessArgv, logData, getContractId, getMasterRegistryUri } = require('./utils');
const { decodePurses } = require('../src/decodePurses');

module.exports.view = async () => {
  const purseId = getProcessArgv('--purse');
  const masterRegistryUri = getMasterRegistryUri();
  const contractId = getContractId();
  const boxId = process.env.BOX_ID;

  let term0 = undefined;
  let purses = {};
  const t = new Date().getTime();
  if (purseId === undefined) {
    term0 = readAllPursesTerm({ masterRegistryUri: masterRegistryUri, contractId: contractId });
    const result1 = await rchainToolkit.http.exploreDeploy(
      process.env.READ_ONLY_HOST,
      {
        term: term0,
      }
    );
    const pursesAsBytes = JSON.parse(result1).expr[0];
    purses = decodePurses(
      pursesAsBytes,
      rchainToolkit.utils.rhoExprToVar,
      rchainToolkit.utils.decodePar
    );
  } else {
    term0 = readPursesTerm({
      masterRegistryUri: masterRegistryUri,
      contractId: contractId,
      pursesIds: [purseId],
    });
    const result1 = await rchainToolkit.http.exploreDeploy(
      process.env.READ_ONLY_HOST,
      {
        term: term0,
      }
    );
    purses = rchainToolkit.utils.rhoValToJs(JSON.parse(result1).expr[0]);
  }

  const term1 = readConfigTerm({ masterRegistryUri, contractId });
  const publicKey = process.env.PRIVATE_KEY
    ? rchainToolkit.utils.publicKeyFromPrivateKey(process.env.PRIVATE_KEY)
    : 'é';

  const result2 = await rchainToolkit.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term1,
  });
  const data = rchainToolkit.utils.rhoValToJs(JSON.parse(result2).expr[0]);
  logData({ ...data, masterRegistryUri });
  const ids = Object.keys(purses);
  if (ids.length === 0) {
    console.log('\n no purses');
    return;
  }

  if (purseId !== undefined) {
    if (!purses[purseId]) {
      console.log('Purse id ' + purseId + ' not found');
      return;
    }
    console.log('\npurse id ' + purseId + '\n');
    console.log(`box        : ${purses[purseId].boxId}`);
    console.log(`type       : ${purses[purseId].type}`);
    console.log(`quantity   : ${purses[purseId].quantity}`);
    console.log(`price      : ${purses[purseId].price || 'not for sale'}`);
    return;
  }
  console.log(
    `\nPurses [0-${ids.length < 99 ? (ids.length - 1) : '99'}] / ${
      ids.length
    }\npurse id          type         box        quantity   price (dust) \n`
  );
  ids.slice(0, 100).forEach((id) => {
    let s = '';
    s += id;
    s = s.padEnd(18, ' ');
    s += purses[id].type;
    s = s.padEnd(31, ' ');
    s += purses[id].boxId;
    s = s.padEnd(42, ' ');
    s += purses[id].quantity;
    s = s.padEnd(53, ' ');
    s +=
      typeof purses[id].price === 'number'
        ? purses[id].price
        : 'not for sale';
    if (purses[id].boxId === boxId) {
      console.log('\x1b[32m' + s);
    } else {
      console.log('\x1b[0m' + s);
    }
  });
  console.log("\nrequest took " + (Math.round(100 * (new Date().getTime() - t)) / 100000) + "s");
  fs.writeFileSync(
    path.join(`./purses-${masterRegistryUri}-${contractId}.json`),
    JSON.stringify(purses, null, 2)
  );
  console.log('\x1b[0m', `\n✓ wrote purses-${masterRegistryUri}.${contractId}.json file`);
};
