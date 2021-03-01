const fs = require('fs');

const replaceEverything = (a) => {
  return (
    a
      .replace(/`/g, '\\`')
      .replace(/\$\{/g, '\\${')
      .replace(/\\\//g, '\\\\/')
      .replace(/FROM_BOX_REGISTRY_URI/g, '${payload.fromBoxRegistryUri}')
      .replace(/TO_BOX_REGISTRY_URI/g, '${payload.toBoxRegistryUri}')
      .replace(/BOX_REGISTRY_URI/g, '${boxRegistryUri}')
      .replace(/REGISTRY_URI/g, '${registryUri}')
      .replace(/PURSE_ID/g, '${payload.purseId}')
      .replace('SIGNATURE', '${signature}')
      .replace(
        'TOKEN_ID',
        '${typeof payload.n == "string" ? \'"\' + payload.n + \'"\' : "Nil"}'
      )
      .replace('NEW_NONCE', '${payload.newNonce}')
      .replace(
        'CREATE_PURSESS_DATA',
        `\${JSON.stringify(payload.data).replace(new RegExp(': null|:null', 'g'), ': Nil')}`
      )
      .replace(
        'CREATE_PURSESS',
        `\${JSON.stringify(payload.purses).replace(new RegExp(': null|:null', 'g'), ': Nil')}`
      )
      .replace('BAG_NONCE', '${payload.bagNonce}')
      .replace('BAG_NONCE_2', '${payload.bagNonce2}')
      // avoid changing "CHANGING_PRICE" string
      .replace('PRICEE', '${payload.price || "Nil"}')
      .replace('QUANTITY', '${payload.quantity}')
      .replace('PUBLIC_KEY', '${payload.publicKey}')
      .replace('BAG_ID', '${payload.bagId}')
      .replace('BAGS_IDS', '${payload.bagsIds}')
      .replace('TOKEN_ID', '${payload.tokenId}')
      // some function name end with BAG_DATA
      .replace(
        ': BAG_DATA',
        ': ${payload.data ? \'"\' + payload.data + \'"\' : "Nil"}'
      )
      .replace(
        '(BAG_DATA)',
        '(${payload.data ? \'"\' + payload.data + \'"\' : "Nil"})'
      )
      // some function name end with _DATA
      .replace(
        ': DATA',
        ': ${payload.data ? \'"\' + payload.data + \'"\' : "Nil"}'
      )
  );
};

const createPursesFile = fs
  .readFileSync('./rholang/create_purses.rho')
  .toString('utf8');
fs.writeFileSync(
  './src/createPursesTerm.js',
  `module.exports.createPursesTerm = (
  registryUri,
  payload
) => {
  return \`${replaceEverything(createPursesFile)}\`;
};
`
);

const readFile = fs.readFileSync('./rholang/read.rho').toString('utf8');

fs.writeFileSync(
  './src/readTerm.js',
  `
module.exports.readTerm = (
  registryUri
) => {
  return \`${replaceEverything(readFile)}\`;
};
`
);

const readPursesIdsFile = fs
  .readFileSync('./rholang/read_purses_ids.rho')
  .toString('utf8');

fs.writeFileSync(
  './src/readPursesIdsTerm.js',
  `
module.exports.readPursesIdsTerm = (
  registryUri
) => {
  return \`${replaceEverything(readPursesIdsFile)}\`;
};
`
);

const readPursesFile = fs
  .readFileSync('./rholang/read_purses.rho')
  .toString('utf8');

fs.writeFileSync(
  './src/readPursesTerm.js',
  `
module.exports.readPursesTerm = (
  registryUri,
  payload
) => {
  return \`${replaceEverything(readPursesFile).replace(
    'PURSES_IDS',
    `\${payload.pursesIds
  .map((id) => '"' + id + '"')
  .join(',')}`
  )}\`;
    }`
);

const readBoxFile = fs.readFileSync('./rholang/read_box.rho').toString('utf8');

fs.writeFileSync(
  './src/readBoxTerm.js',
  `
module.exports.readBoxTerm = (
  boxRegistryUri
) => {
  return \`${replaceEverything(readBoxFile)}\`;
};
`
);

const boxFile = fs.readFileSync('./rholang/box.rho').toString('utf8');

fs.writeFileSync(
  './src/boxTerm.js',
  `
module.exports.boxTerm = () => {
  return \`${replaceEverything(boxFile)}\`;
};
`
);

const sendPurseFile = fs
  .readFileSync('./rholang/send_purse.rho')
  .toString('utf8');

fs.writeFileSync(
  './src/sendPurseTerm.js',
  `module.exports.sendPurseTerm = (
    registryUri,
  payload
) => {
  return \`${replaceEverything(sendPurseFile)}\`;
};
`
);

const mainTerm = fs.readFileSync('./rholang/main.rho').toString('utf8');
fs.writeFileSync(
  './src/mainTerm.js',
  `module.exports.mainTerm = (fromBoxRegistryUri, payload) => {
    return \`${mainTerm
      .replace(/`/g, '\\`')
      .replace(/\\\//g, '\\\\/')
      .replace(/\$\{/g, '\\${')
      .replace(/FUNGIBLE/g, '${payload.fungible}')
      .replace(/FROM_BOX_REGISTRY_URI/g, '${fromBoxRegistryUri}')}\`;
};
`
);
