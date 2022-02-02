const fs = require('fs');
const { VERSION } = require('./constants');

const replaceEverything = (a) => {
  return (
    a
      .replace(/`/g, '\\`')
      .replace(/\$\{/g, '\\${')
      .replace(/\\\//g, '\\\\/')
      .replace(/TO_BOX_ID/g, '${payload.toBoxId}')
      .replace(/WITHDRAW_QUANTITY/g, '${payload.withdrawQuantity}')
      .replace(/MERGE/g, '${payload.merge}')
      .replace(/MASTER_REGISTRY_URI/g, '${payload.masterRegistryUri}')
      .replace(/BOX_REGISTRY_URI/g, '${boxRegistryUri}')
      .replace(/REGISTRY_URI/g, '${registryUri}')
      .replace(/CONTRACT_ID/g, '${payload.contractId}')
      .replace(/BOX_ID/g, '${payload.boxId}')
      .replace(/PURSE_ID/g, '${payload.purseId}')
      .replace(/NEW_ID/g, '${payload.newId ? payload.newId : ""}')
      .replace(/SPLIT_PURSE_QUANTITY/g, '${payload.quantityInNewPurse}')
      .replace(/WITHDRAW_PURSE_QUANTITY/g, '${payload.quantityToWithdraw}')
      .replace(
        /\: FEE/g,
        ': ${payload.fee ? `("${payload.fee[0]}", ${payload.fee[1]})` : "Nil"}'
      )
      .replace('SIGNATURE', '${signature}')
      .replace(
        'TOKEN_ID',
        '${typeof payload.n == "string" ? \'"\' + payload.n + \'"\' : "Nil"}'
      )
      .replace('NEW_NONCE', '${payload.newNonce}')
      .replace('UPDATE_PURSE_DATAA', `\${payload.data}`)
      .replace('PURCHASE_PURSE_DATA', `\${payload.data}`)
      .replace('SWAP_DATA', `\${payload.data}`)
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
      .replace('PRICEE', '${payload.price ? "(" + payload.price + ")": "Nil"}')
      .replace('QUANTITY', '${payload.quantity}')
      .replace('PUBLIC_KEY', '${payload.publicKey}')
      .replace('REV_ADDRESS', '${payload.revAddress}')
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

const creditFile = fs
  .readFileSync('./rholang/op_credit.rho')
  .toString('utf8');
fs.writeFileSync(
  './src/creditTerm.js',
  `/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.creditTerm = (
  payload
) => {
  return \`${replaceEverything(creditFile)}\`;
};
`
);


const swapFile = fs
  .readFileSync('./rholang/op_swap.rho')
  .toString('utf8');
fs.writeFileSync(
  './src/swapTerm.js',
  `/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.swapTerm = (
  payload
) => {
  return \`${replaceEverything(swapFile)}\`;
};
`
);

const renewFile = fs.readFileSync('./rholang/op_renew.rho').toString('utf8');
fs.writeFileSync(
  './src/renewTerm.js',
  `/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.renewTerm = (
  payload
) => {
  return \`${replaceEverything(renewFile)}\`;
};
`
);

const deployBoxFile = fs
  .readFileSync('./rholang/op_deploy_box.rho')
  .toString('utf8');
fs.writeFileSync(
  './src/deployBoxTerm.js',
  `/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.deployBoxTerm = (
  payload
) => {
  return \`${replaceEverything(deployBoxFile)}\`;
};
`
);

const lockFile = fs.readFileSync('./rholang/op_lock.rho').toString('utf8');
fs.writeFileSync(
  './src/lockTerm.js',
  `/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.lockTerm = (
  payload
) => {
  return \`${replaceEverything(lockFile)}\`;
};
`
);

const updateFeeFile = fs.readFileSync('./rholang/op_update_fee.rho').toString('utf8');
fs.writeFileSync(
  './src/updateFeeTerm.js',
  `/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.updateFeeTerm = (
  payload
) => {
  return \`${replaceEverything(updateFeeFile)}\`;
};
`
);

const deletePurseFile = fs
  .readFileSync('./rholang/op_delete_purse.rho')
  .toString('utf8');
fs.writeFileSync(
  './src/deletePurseTerm.js',
  `/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.deletePurseTerm = (
  payload
) => {
  return \`${replaceEverything(deletePurseFile)}\`;
};
`
);

const updatePursePriceFile = fs
  .readFileSync('./rholang/op_update_purse_price.rho')
  .toString('utf8');
fs.writeFileSync(
  './src/updatePursePriceTerm.js',
  `/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.updatePursePriceTerm = (
  payload
) => {
  return \`${replaceEverything(updatePursePriceFile)}\`;
};
`
);

const readConfigFile = fs
  .readFileSync('./rholang/read_config.rho')
  .toString('utf8');
fs.writeFileSync(
  './src/readConfigTerm.js',
  `/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.readConfigTerm = (
  payload
) => {
  return \`${replaceEverything(readConfigFile)}\`;
};
`
);

const deleteExpiredPurseFile = fs
  .readFileSync('./rholang/op_delete_expired_purse.rho')
  .toString('utf8');
fs.writeFileSync(
  './src/deleteExpiredPurseTerm.js',
  `/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.deleteExpiredPurseTerm = (
  payload
) => {
  return \`${replaceEverything(deleteExpiredPurseFile)}\`;
};
`
);

const readBoxFile = fs.readFileSync('./rholang/read_box.rho').toString('utf8');

fs.writeFileSync(
  './src/readBoxTerm.js',
  `/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.readBoxTerm = (
  payload
) => {
  return \`${replaceEverything(readBoxFile)}\`;
};
`
);

const readLogsFile = fs
  .readFileSync('./rholang/read_logs.rho')
  .toString('utf8');

fs.writeFileSync(
  './src/readLogsTerm.js',
  `/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.readLogsTerm = (
  payload
) => {
  return \`${replaceEverything(readLogsFile)}\`;
};
`
);

const withdrawFile = fs
  .readFileSync('./rholang/op_withdraw.rho')
  .toString('utf8');

fs.writeFileSync(
  './src/withdrawTerm.js',
  `/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.withdrawTerm = (
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
  `/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.updatePurseDataTerm = (
  payload
) => {
  return \`${replaceEverything(updatePurseDataFile)}\`;
};
`
);

const masterTerm = fs.readFileSync('./rholang/master.rho').toString('utf8');
const treeHashMapTerm = fs
  .readFileSync('./rholang/tree_hash_map.rho')
  .toString('utf8')
  .replace(/`/g, '\\`');

fs.writeFileSync(
  './src/masterTerm.js',
  `/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.masterTerm = (payload) => {
    return \`${masterTerm
      .replace(/`/g, '\\`')
      .replace(/\\\//g, '\\\\/')
      .replace(/\$\{/g, '\\${')
      .replace(/VERSION/g, `"${VERSION}"`)
      .replace(/DEPTH_CONTRACT/g, '${payload.contractDepth || 2}')
      .replace(/DEPTH/g, '${payload.depth || 3}')
      .replace(/TREE_HASH_MAP/g, treeHashMapTerm + ' |')}\`;
};
`
);

const deployTerm = fs.readFileSync('./rholang/op_deploy.rho').toString('utf8');

fs.writeFileSync(
  './src/deployTerm.js',
  `/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.deployTerm = (payload) => {
    return \`${deployTerm
      .replace(/`/g, '\\`')
      .replace(/\\\//g, '\\\\/')
      .replace(/\$\{/g, '\\${')
      .replace(
        /\: FEE/g,
        ': ${payload.fee ? `("${payload.fee[0]}", ${payload.fee[1]})` : "Nil"}'
      )
      .replace(/EXPIRES/g, '${payload.expires ? payload.expires : "Nil"}')
      .replace(/CONTRACT_ID/g, '${payload.contractId}')
      .replace(/BOX_ID/g, '${payload.boxId}')
      .replace(/MASTER_REGISTRY_URI/g, '${payload.masterRegistryUri}')
      .replace(/FUNGIBLE/g, '${payload.fungible}')}\`;
};
`
);
