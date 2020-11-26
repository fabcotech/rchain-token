const rchainToolkit = require('rchain-toolkit');
const uuidv4 = require("uuid/v4");

const {
  mainTerm,
} = require('../src/');

const {
  log,
  validAfterBlockNumber,
  prepareDeploy,
  logData,
} = require('./utils');

module.exports.deploy = async () => {
  const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(process.env.PRIVATE_KEY);
  const newNonce = uuidv4().replace(/-/g, "");
  const timestamp = new Date().getTime();
  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const pd = await prepareDeploy(
    process.env.READ_ONLY_HOST,
    publicKey,
    timestamp
  );
  const term = mainTerm(newNonce, publicKey);
  log('✓ prepare deploy');

  const deployOptions = await rchainToolkit.utils.getDeployOptions(
    "secp256k1",
    timestamp,
    term,
    process.env.PRIVATE_KEY,
    publicKey,
    1,
    1000000,
    vab || -1
  );

  try {
    const deployResponse = await rchainToolkit.http.deploy(
      process.env.VALIDATOR_HOST,
      deployOptions
    );
    if (!deployResponse.startsWith('"Success!')) {
      log("Unable to deploy");
      console.log(deployResponse);
      process.exit();
    }
  } catch (err) {
    log("Unable to deploy");
    console.log(err);
    process.exit();
  }
  log('✓ deploy');
  
  let dataAtNameResponse;
  try {
    dataAtNameResponse = await new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        try {
          rchainToolkit.http
            .dataAtName(process.env.VALIDATOR_HOST, {
              name: {
                UnforgPrivate: { data: JSON.parse(pd).names[0] }
              },
              depth: 3,
            })
            .then((dataAtNameResponse) => {
              if (
                dataAtNameResponse &&
                JSON.parse(dataAtNameResponse) &&
                JSON.parse(dataAtNameResponse).exprs &&
                JSON.parse(dataAtNameResponse).exprs.length
              ) {
                resolve(dataAtNameResponse);
                clearInterval(interval);
              } else {
                log("Did not find transaction data, will try again in 15 seconds");
              }
            })
            .catch((err) => {
              log("Cannot retreive transaction data, will try again in 15 seconds");
              console.log(err);
              process.exit();
            });
        } catch (err) {
          log(
            "Cannot retreive transaction data, will try again in 15 seconds"
          );
          console.log(err);
          process.exit();
        }
      }, 15000);
    });
  } catch (err) {
    log("Failed to parse dataAtName response", "error");
    console.log(err);
    process.exit();
  }
  const data = rchainToolkit.utils.rhoValToJs(JSON.parse(dataAtNameResponse).exprs[0].expr);
  log('✓ deployed and retrieved data from the blockchain');
  console.log(logData(data));
}