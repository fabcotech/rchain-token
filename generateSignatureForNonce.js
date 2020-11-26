const rchainToolkit = require("rchain-toolkit");
const { blake2b } = require("blakejs");

/*
  This script will output the signature required by the names.rho contract to
  update a record on chain
*/

/*
  PRIVATE_KEY: string;
  Private key that corresponds to the public key of the record you wish to update
*/
const PRIVATE_KEY =
  "b37fc4f4d7870e6301d5d560a94510a3c0b7908e39fcf9d32d9e75f9465310ab";
/*
  NONCE: string;
  Nonce of the record you wish to update
*/
const NONCE = "92ddc454a1374a869552cdc7181ab134";

const bufferToSign = Buffer.from(NONCE, "utf8");
const uInt8Array = new Uint8Array(bufferToSign);

const blake2bHash = blake2b(uInt8Array, 0, 32);

const signature = rchainToolkit.utils.signSecp256k1(blake2bHash, PRIVATE_KEY);

const signatureHex = Buffer.from(signature).toString("hex");

console.log("SIGNATURE :", signatureHex);
