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
      .replace(/NEW_ID/g, '${payload.newId ? payload.newId : "Nil"}')
      .replace(/SPLIT_PURSE_QUANTITY/g, '${payload.quantityInNewPurse}')
      .replace(/WITHDRAW_PURSE_QUANTITY/g, '${payload.quantityToWithdraw}')
      .replace('SIGNATURE', '${signature}')
      .replace(
        'TOKEN_ID',
        '${typeof payload.n == "string" ? \'"\' + payload.n + \'"\' : "Nil"}'
      )
      .replace('NEW_NONCE', '${payload.newNonce}')
      .replace('UPDATE_PURSE_DATA', `\${payload.data}`)
      .replace('PURCHASE_PURSE_DATA', `\${payload.data}`)
      .replace(
        'ACTION_AFTER_PURCHASE',
        `\${payload.actionAfterPurchase || "PUBLIC_RECEIVE_PURSE"}`
      )
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
      // some function name end with _DATA
      .replace(
        ': DATA',
        ': ${payload.data ? \'"\' + payload.data + \'"\' : "Nil"}'
      )
  );
};

const createPursesFile = fs
  .readFileSync('./rholang/op_create_purses.rho')
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

const purchaseFile = fs
  .readFileSync('./rholang/op_purchase.rho')
  .toString('utf8');
fs.writeFileSync(
  './src/purchaseTerm.js',
  `module.exports.purchaseTerm = (
  registryUri,
  payload
) => {
  return \`${replaceEverything(purchaseFile)}\`;
};
`
);

const setPriceFile = fs
  .readFileSync('./rholang/op_set_price.rho')
  .toString('utf8');
fs.writeFileSync(
  './src/setPriceTerm.js',
  `module.exports.setPriceTerm = (
  registryUri,
  payload
) => {
  return \`${replaceEverything(setPriceFile)}\`;
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

const readPursesDataFile = fs
  .readFileSync('./rholang/read_purses_data.rho')
  .toString('utf8');

fs.writeFileSync(
  './src/readPursesDataTerm.js',
  `
module.exports.readPursesDataTerm = (
  registryUri,
  payload
) => {
  return \`${replaceEverything(readPursesDataFile).replace(
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
module.exports.boxTerm = (payload) => {
  return \`${replaceEverything(boxFile)}\`;
};
`
);

const sendPurseFile = fs
  .readFileSync('./rholang/op_send_purse.rho')
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

const splitPurseFile = fs
  .readFileSync('./rholang/op_split_purse.rho')
  .toString('utf8');
fs.writeFileSync(
  './src/splitPurseTerm.js',
  `module.exports.splitPurseTerm = (
    registryUri,
  payload
) => {
  return \`${replaceEverything(splitPurseFile)}\`;
};
`
);

const withdrawFile = fs
  .readFileSync('./rholang/op_withdraw.rho')
  .toString('utf8');

fs.writeFileSync(
  './src/withdrawTerm.js',
  `module.exports.withdrawTerm = (
    registryUri,
  payload
) => {
  return \`${replaceEverything(withdrawFile)}\`;
};
`
);

const updatePurseDataFile = fs
  .readFileSync('./rholang/op_update_purse_data.rho')
  .toString('utf8');

fs.writeFileSync(
  './src/updatePurseDataTerm.js',
  `module.exports.updatePurseDataTerm = (
    registryUri,
  payload
) => {
  return \`${replaceEverything(updatePurseDataFile)}\`;
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
