const rc = require('@fabcotech/rchain-toolkit');

const PRIVATE_KEY = '28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36';
const PUBLIC_KEY = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY);

module.exports.PRIVATE_KEY = PRIVATE_KEY;
module.exports.PUBLIC_KEY = PUBLIC_KEY;

const PRIVATE_KEY_2 = 'a2803d16030f83757a5043e5c0e28573685f6d8bf4e358bf1385d82bffa8e698';
const PUBLIC_KEY_2 = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY_2);

module.exports.PRIVATE_KEY_2 = PRIVATE_KEY_2;
module.exports.PUBLIC_KEY_2 = PUBLIC_KEY_2;

const PRIVATE_KEY_3 = "62dce7c35de80ba4bbdebc2653d3ca4d7b46454a7b7a992ef36593f5a0c81b31"
const PUBLIC_KEY_3 = rc.utils.publicKeyFromPrivateKey(PRIVATE_KEY_3);

module.exports.PRIVATE_KEY_3 = PRIVATE_KEY_3;
module.exports.PUBLIC_KEY_3 = PUBLIC_KEY_3;