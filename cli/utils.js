const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');
const { blake2b } = require("blakejs");

const getProcessArgv = (param) => {
  const index = process.argv.findIndex((arg) => arg === param);
  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
};
module.exports.getProcessArgv = getProcessArgv;

module.exports.logData = (data) => {
  const str = `
Public key     : ${data.publicKey}
Registry URI   : ${data.registryUri.replace('rho:id:', '')}
Contract nonce : ${data.nonce}
Locked         : ${data.locked}
Version        : ${data.version}`;
  return str;
}

module.exports.prepareDeploy = async (httpUrlReadOnly, publicKey, timestamp) => {
  let prepareDeployResponse;
  try {
    prepareDeployResponse = await rchainToolkit.http.prepareDeploy(
      httpUrlReadOnly,
      {
        deployer: publicKey,
        timestamp: timestamp,
        nameQty: 1,
      }
    );
  } catch (err) {
    log("Unable to prepare deploy");
    console.log(err);
    process.exit();
  }

  return prepareDeployResponse;
}

module.exports.validAfterBlockNumber = async (httpUrlReadOnly) => {
  let validAfterBlockNumberResponse;
  try {
    validAfterBlockNumberResponse = JSON.parse(
      await rchainToolkit.http.blocks(httpUrlReadOnly, {
        position: 1,
      })
    )[0].blockNumber;
  } catch (err) {
    log("Unable to get last finalized block", "error");
    console.log(err);
    process.exit();
  }
  return validAfterBlockNumberResponse;
}

const log = (a, level = "info") => {
  if (level === "warning") {
    console.log("\x1b[33m%s\x1b[0m", new Date().toISOString() + " [WARN] " + a);
  } else if (level === "error") {
    console.log(
      "\x1b[31m%s\x1b[0m",
      new Date().toISOString() + " [ERROR] " + a
    );
  } else {
    console.log(new Date().toISOString(), a);
  }
};
module.exports.log = log;


module.exports.generateSignature = (nonce, privateKey) => {
  const bufferToSign = Buffer.from(nonce, "utf8");
  const uInt8Array = new Uint8Array(bufferToSign);
  const blake2bHash = blake2b(uInt8Array, 0, 32);
  const signature = rchainToolkit.utils.signSecp256k1(blake2bHash, privateKey);
  const signatureHex = Buffer.from(signature).toString("hex");

  return signatureHex;
}

module.exports.buildUnforgeableNameQuery = unforgeableName => {
  return {
    UnforgPrivate: { data: unforgeableName }
  };
};


// command line arguments

module.exports.getTokenId = () => {
  const tokenId = getProcessArgv('--token');
  return tokenId;
}

module.exports.getNonce = () => {
  const nonce = getProcessArgv('--nonce');
  if(typeof nonce !== "string") {
    console.log('Missing arguments --nonce');
    process.exit();
  }
  return nonce;
}

module.exports.getContractNonce = () => {
  const nonce = getProcessArgv('--contract-nonce');
  if(typeof nonce !== "string") {
    console.log('Missing arguments --contract-nonce');
    process.exit();
  }
  return nonce;
}

module.exports.getPrice = () => {
  const price = getProcessArgv('--price') ?
    parseInt(getProcessArgv('--price'), 10) :
    undefined;
  if(typeof price !== "number" || isNaN(price)) {
    console.log('Missing arguments --price');
    process.exit();
  }
  return price;
}

module.exports.getQuantity = () => {
  const quantity = getProcessArgv('--quantity') ?
    parseInt(getProcessArgv('--quantity'), 10) :
    undefined;
  if(typeof quantity !== "number" || isNaN(quantity)) {
    console.log('Missing arguments --quantity');
    process.exit();
  }
  return quantity;
}

module.exports.getPublicKey = () => {
  const publicKey = getProcessArgv('--public-key');
  if(typeof publicKey !== "string") {
    console.log('Missing arguments --public-key');
    process.exit();
  }
  return publicKey;
}

module.exports.getBagId = () => {
  const bagId = getProcessArgv('--bag') ?
    parseInt(getProcessArgv('--bag'), 10) :
    undefined;
  if(typeof bagId !== "number" || isNaN(bagId)) {
    console.log('Missing arguments --bag');
    process.exit();
  }
  return bagId;
}

module.exports.getFile = () => {
  const path = getProcessArgv('--file');
  if(typeof path !== "string" || !fs.existsSync(path)) {
    console.log('Missing arguments --file, or file does not exist');
    process.exit();
  }
  const data = fs.readFileSync(path, 'utf8');
  return data;
}

module.exports.getRegistryUri = () => {
  let registryUri = getProcessArgv('--registry-uri');
  if (!registryUri) {
    registryUri = getProcessArgv('-r');
  }
  if (typeof registryUri !== "string") {
    registryUri = process.env.REGISTRY_URI;
  }
  if(typeof registryUri !== "string" || registryUri.length === 0) {
    console.log('Missing arguments --registry-uri, or -r, or REGISTRY_URI=* in .env file');
    process.exit();
  }
  return registryUri;
}