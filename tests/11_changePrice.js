const rc = require('rchain-toolkit');
const uuidv4 = require('uuid/v4');

const { changePriceTerm } = require('../src');
const {
  validAfterBlockNumber,
  generateSignature,
  prepareDeploy,
} = require('../cli/utils');

module.exports.main = async (
  registryUri,
  bagNonce,
  privateKey2,
  publicKey2,
  bagId
) => {
  const timestamp = new Date().getTime();
  const pd = await prepareDeploy(
    process.env.READ_ONLY_HOST,
    publicKey2,
    timestamp
  );

  const payload = {
    nonce: bagNonce,
    bagNonce: uuidv4().replace(/-/g, ''),
    bagId: bagId,
    price: 12,
  };

  const ba = rc.utils.toByteArray(payload);
  const signature = generateSignature(ba, privateKey2);
  const term = changePriceTerm(registryUri, payload, signature);

  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const deployOptions = await rc.utils.getDeployOptions(
    'secp256k1',
    timestamp,
    term,
    privateKey2,
    publicKey2,
    1,
    10000000,
    vab
  );
  try {
    const deployResponse = await rc.http.deploy(
      process.env.VALIDATOR_HOST,
      deployOptions
    );
    if (!deployResponse.startsWith('"Success!')) {
      console.log(deployResponse);
      throw new Error('11_changePrice 01');
    }
  } catch (err) {
    console.log(err);
    throw new Error('11_changePrice 02');
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
                clearInterval(interval);
                resolve(dataAtNameResponse);
              } else {
                console.log(
                  'Did not find transaction data, will try again in 15 seconds'
                );
              }
            })
            .catch((err) => {
              console.log(err);
              throw new Error('11_changePrice 03');
            });
        } catch (err) {
          console.log(err);
          throw new Error('11_changePrice 04');
        }
      }, 15000);
    });
  } catch (err) {
    console.log(err);
    throw new Error('11_changePrice 05');
  }
  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  return;
};
