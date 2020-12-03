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
        '${typeof payload.n == "string" ? \'"\' + payload.n + \'"\' : "Nil"}'
      )
      .replace("NEW_NONCE", "${payload.newNonce}")
      .replace("BAG_NONCE", "${payload.bagNonce}")
      .replace("BAG_NONCE_2", "${payload.bagNonce2}")
      // avoid changing "CHANGING_PRICE" string
      .replace("PRICEE", '${payload.price || "Nil"}')
      .replace("QUANTITY", "${payload.quantity}")
      .replace("PUBLIC_KEY", "${payload.publicKey}")
      .replace("BAG_ID", "${payload.bagId}")
      .replace("TOKEN_ID", "${payload.tokenId}")
      // some function name end with BAG_DATA
      .replace(
        ": BAG_DATA",
        ": ${payload.data ? '\"' + payload.data + '\"' : \"Nil\"}"
      )
      .replace(
        "(BAG_DATA)",
        "(${payload.data ? '\"' + payload.data + '\"' : \"Nil\"})"
      )
      // some function name end with _DATA
      .replace(": DATA", ": ${payload.data ? '\"' + payload.data + '\"' : \"Nil\"}")
  );
};
fs.writeFileSync(
  "./src/createTokensTerm.js",
  `module.exports.createTokensTerm = (
  registryUri,
  payload,
  signature,
) => {
  return \`${replaceEverything(createTokensFile)}\`;
};
`
);

const purchaseTokensFile = fs
  .readFileSync("./purchase_tokens.rho")
  .toString("utf8");

fs.writeFileSync(
  "./src/purchaseTokensTerm.js",
  `
module.exports.purchaseTokensTerm = (
  registryUri,
  payload
) => {
  return \`${replaceEverything(purchaseTokensFile)}\`;
};
`
);

const setLockedFile = fs.readFileSync("./set_locked.rho").toString("utf8");

fs.writeFileSync(
  "./src/setLockedTerm.js",
  `module.exports.setLockedTerm = (registryUri, payload, signature) => {
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
  payload,
  signature, 
) => {
  return \`${replaceEverything(updateTokenDataFile)}\`;
};
`
);

const updateBagDataFile = fs
  .readFileSync("./update_bag_data.rho")
  .toString("utf8");

fs.writeFileSync(
  "./src/updateBagDataTerm.js",
  `module.exports.updateBagDataTerm = (
  registryUri,
  payload,
  signature,
) => {
  return \`${replaceEverything(updateBagDataFile)}\`;
};
`
);

const sendTokensFile = fs.readFileSync("./send_tokens.rho").toString("utf8");

fs.writeFileSync(
  "./src/sendTokensTerm.js",
  `module.exports.sendTokensTerm = (
  registryUri,
  payload,
  signature, 
) => {
  return \`${replaceEverything(sendTokensFile)}\`;
};
`
);

const changePriceFile = fs.readFileSync("./change_price.rho").toString("utf8");

fs.writeFileSync(
  "./src/changePriceTerm.js",
  `module.exports.changePriceTerm = (
  registryUri,
  payload,
  signature,
) => {
  return \`${replaceEverything(changePriceFile)}\`;
};
`
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
};
`
);
