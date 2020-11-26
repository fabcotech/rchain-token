const uuidv4 = require("uuid/v4");

console.log("NONCE :", uuidv4().replace(/-/g, ""));
