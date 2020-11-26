const fs = require("fs");

const createTokensFile = fs
  .readFileSync("./create_tokens.rho")
  .toString("utf8");

const replaceEverything = (a) => {
  return (
    a
      .replace(/`/g, "\\`")
      .replace(/\$\{/g, "\\${")
      .replace(/\\\//g, "\\\\/")
      .replace("REGISTRY_URI", "${registryUri}")
      .replace("SIGNATURE", "${signature}")
      .replace(
        "TOKEN_ID",
        '${typeof n == "string" ? \'"\' + n + \'"\' : "Nil"}'
      )
      .replace("NEW_NONCE", "${newNonce}")
      .replace("BAG_NONCE", "${bagNonce}")
      .replace("BAG_NONCE_2", "${bagNonce2}")
      .replace("PRICE", '${price || "Nil"}')
      .replace("QUANTITY", "${quantity}")
      .replace("PUBLIC_KEY", "${publicKey}")
      .replace("BAG_ID", "${bagId}")
      .replace("TOKEN_ID", "${tokenId}")
      // some function name end with BAG_DATA
      .replace(
        ": BAG_DATA",
        ": ${data ? '\"' + encodeURI(data) + '\"' : \"Nil\"}"
      )
      .replace(
        "(BAG_DATA)",
        "(${data ? '\"' + encodeURI(data) + '\"' : \"Nil\"})"
      )
      // some function name end with _DATA
      .replace(": DATA", ": ${data ? '\"' + encodeURI(data) + '\"' : \"Nil\"}")
  );
};
fs.writeFileSync(
  "./src/createTokensTerm.js",
  `module.exports.createTokensTerm = (
  registryUri,
  signature,
  newNonce,
  bagNonce,
  publicKey,
  n,
  price,
  quantity,
  data
) => {
  return \`${replaceEverything(createTokensFile)}\`;
};`
);

const purchaseTokensFile = fs
  .readFileSync("./purchase_tokens.rho")
  .toString("utf8");

fs.writeFileSync(
  "./src/purchaseTokensTerm.js",
  `
module.exports.purchaseTokensTerm = (
  registryUri,
  bagId,
  price,
  data,
  quantity,
  publicKey,
  bagNonce
) => {
  return \`${replaceEverything(purchaseTokensFile)}\`;
};
`
);

const setLockedFile = fs.readFileSync("./set_locked.rho").toString("utf8");

fs.writeFileSync(
  "./src/setLockedTerm.js",
  `module.exports.setLockedTerm = (registryUri, newNonce, signature) => {
  return \`${replaceEverything(setLockedFile)}\`;
};`
);

const updateTokenDataFile = fs
  .readFileSync("./update_token_data.rho")
  .toString("utf8");

fs.writeFileSync(
  "./src/updateTokenDataTerm.js",
  `module.exports.updateTokenDataTerm = (
  registryUri,
  newNonce,
  signature,
  n,
  data    
) => {
  return \`${replaceEverything(updateTokenDataFile)}\`;
};`
);

const updateBagDataFile = fs
  .readFileSync("./update_bag_data.rho")
  .toString("utf8");

fs.writeFileSync(
  "./src/updateBagDataTerm.js",
  `module.exports.updateBagDataTerm = (
  registryUri,
  newNonce,
  signature,
  bagId,
  data
) => {
  return \`${replaceEverything(updateBagDataFile)}\`;
};`
);

const sendTokensFile = fs.readFileSync("./send_tokens.rho").toString("utf8");

fs.writeFileSync(
  "./src/sendTokensTerm.js",
  `module.exports.sendTokensTerm = (
  registryUri,
  signature,
  bagNonce,
  bagNonce2,
  quantity,
  publicKey,
  bagId,
  data    
) => {
  return \`${replaceEverything(sendTokensFile)}\`;
};`
);

const mainTerm = fs.readFileSync("./main.rho").toString("utf8");

fs.writeFileSync(
  "./src/mainTerm.js",
  `module.exports.mainTerm = (newNonce, publicKey) => {
    return \`${mainTerm
      .replace(/`/g, "\\`")
      .replace(/\\\//g, "\\\\/")
      .replace(/\$\{/g, "\\${")
      .replace(/NEW_NONCE/g, "${newNonce}")
      .replace(/PUBLIC_KEY/g, "${publicKey}")}\`;
};`
);
