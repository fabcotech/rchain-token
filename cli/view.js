const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');
const path = require('path');

const { readConfigTerm, readPursesTerm, readAllPursesTerm } = require('../src');
const {
  getProcessArgv,
  logData,
  getContractId,
  getMasterRegistryUri,
} = require('./utils');
const { decodePurses } = require('../src/decodePurses');

const formatDuration = (t) => {
  let sa = t;
  const d = Math.floor(sa / 1000 / 60 / 60 / 24);
  sa = sa - d * 24 * 60 * 60 * 1000;
  const h = Math.floor(sa / 1000 / 60 / 60);
  sa = sa - h * 60 * 60 * 1000;
  const m = Math.floor(sa / 1000 / 60);
  sa = sa - m * 60 * 1000;
  return `${d}d${h}h${m}m`;
};

module.exports.view = async () => {
  const purseId = getProcessArgv('--purse-id');
  const masterRegistryUri = getMasterRegistryUri();
  const contractId = getContractId();
  const boxId = process.env.BOX_ID;
  console.log("[warning] we assume the depth of the contract's thm is 2");
  let term0 = undefined;
  let purses = {};
  const t = new Date().getTime();
  if (purseId === undefined) {
    term0 = readAllPursesTerm({
      masterRegistryUri: masterRegistryUri,
      contractId: contractId,
      depth: 2,
    });
    const result1 = await rchainToolkit.http.exploreDeploy(
      process.env.READ_ONLY_HOST,
      {
        term: term0,
      }
    );

    const parsed = JSON.parse(result1);
    if (!parsed.expr[0]) {
      console.log(`contract ${masterRegistryUri}.${contractId} not found`);
      return;
    }
    const pursesAsBytes = parsed.expr[0];
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

  const result2 = await rchainToolkit.http.exploreDeploy(
    process.env.READ_ONLY_HOST,
    {
      term: term1,
    }
  );
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
    console.log(`quantity   : ${purses[purseId].quantity}`);
    console.log(purses[purseId].price[1])

    if (purses[purseId].price) {
      if (typeof purses[purseId].price[1] === "number") {
        console.log(`sell order : ${purses[purseId].price[1]} ${purses[purseId].price[0]} per token`);
      } else {
        console.log(`sell order : swap with nft "${purses[purseId].price[0]}".${purses[purseId].price[1]}`);
      }
    } else {
      console.log(`sell order : none`);
    }
  }
  let expiration = '       ';
  if (data.fungible === false) {
    expiration = '          expiration';
  }
  console.log(
    `\nPurses [0-${ids.length < 99 ? ids.length - 1 : '99'}] / ${
      ids.length
    }\npurse id          box        quantity     sell order                 ${expiration} \n`
  );
  const now = new Date().getTime();
  ids.slice(0, 100).forEach((id) => {
    let expires = '-';
    if (data.fungible === true) {
      expires = '';
    }
    if (data.fungible === false && data.expires && id !== '0') {
      const timestamp = purses[id].timestamp;
      if (now - timestamp > data.expires) {
        expires =
          'expired for ' + formatDuration(now - timestamp - data.expires);
      } else {
        expires = 'in ' + formatDuration(timestamp - now + data.expires);
      }
    }
    let s = '';
    s += id;
    s = s.padEnd(18, ' ');
    s += purses[id].boxId;
    s = s.padEnd(29, ' ');
    s += purses[id].quantity;
    s = s.padEnd(42, ' ');
    //console.log(purses[id].price)
    if (purses[id].price) {
      if (typeof purses[id].price[1] === "number") {
        s += `${purses[id].price[1]} ${purses[id].price[0]} per token`;
      } else if (typeof purses[id].price[1] === "string") {
        s += `<-> nft ${purses[id].price[0]}.${purses[id].price[1]}`;
      } else {
        throw new Error('invalid price ' + purses[id].price)
      }
    } else {
      s += `no sell order`;
    }
    s = s.padEnd(78, ' ');
    s += expires;
    if (purses[id].boxId === boxId) {
      console.log('\x1b[32m' + s);
    } else {
      console.log('\x1b[0m' + s);
    }
  });
  console.log(
    '\nrequest took ' +
      Math.round(100 * (new Date().getTime() - t)) / 100000 +
      's'
  );
  fs.writeFileSync(
    path.join(`./purses-${masterRegistryUri}-${contractId}.json`),
    JSON.stringify(purses, null, 2)
  );
  console.log(
    '\x1b[0m',
    `\n✓ wrote purses-${masterRegistryUri}.${contractId}.json file`
  );
};
