const rc = require('rchain-toolkit');
const uuidv4 = require('uuid/v4');

const { validAfterBlockNumber, prepareDeploy } = require('../cli/utils');
const getRandomName = require('./getRandomName').main;

module.exports.main = async (registryUri, privateKey, publicKey, bagId) => {
  const timestamp = new Date().getTime();
  const pd = await prepareDeploy(
    process.env.READ_ONLY_HOST,
    publicKey,
    timestamp
  );
  const term = purchaseTokensTerm(registryUri, {
    publicKey: publicKey,
    bagId: bagId,
    quantity: 1,
    price: 11,
    bagNonce: uuidv4().replace(/-/g, ''),
    data: undefined,
  });

  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const deployOptions = await rc.utils.getDeployOptions(
    'secp256k1',
    timestamp,
    term,
    privateKey,
    publicKey,
    1,
    100000000,
    vab
  );
  try {
    const deployResponse = await rc.http.deploy(
      process.env.VALIDATOR_HOST,
      deployOptions
    );
    if (!deployResponse.startsWith('"Success!')) {
      console.log(deployResponse);
      throw new Error('05_purchase 01');
    }
  } catch (err) {
    console.log(err);
    throw new Error('05_purchase 02');
  }

  let dataAtNameResponse;
  try {
    dataAtNameResponse = await new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        try {
          rc.http
            .dataAtName(process.env.VALIDATOR_HOST, {
              name: {
                UnforgPrivate: { data: JSON.parse(pd).names[0] },
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
                const data = rc.utils.rhoValToJs(
                  JSON.parse(dataAtNameResponse).exprs[0].expr
                );
                if (
                  data.message ===
                  'error: REV transfer went wrong, issuer was refunded 11'
                ) {
                  resolve(dataAtNameResponse);
                  clearInterval(interval);
                } else {
                  console.log(data);
                  throw new Error(
                    '11_try_purchase should have fail to purchase from bag 1 and should have recieve error message'
                  );
                }
              } else {
                console.log(
                  'Did not find transaction data, will try again in 4 seconds'
                );
              }
            })
            .catch((err) => {
              console.log(err);
              throw new Error('05_purchase 03');
            });
        } catch (err) {
          console.log(err);
          throw new Error('05_purchase 04');
        }
      }, 4000);
    });
  } catch (err) {
    console.log(err);
    throw new Error('05_purchase 05');
  }
  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  return;
};