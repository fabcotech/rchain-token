const rc = require('rchain-toolkit');
const uuidv4 = require('uuid/v4');

const { createTokensTerm } = require('../src/createTokensTerm');
const {
  validAfterBlockNumber,
  generateSignature,
  prepareDeploy,
} = require('../cli/utils');
const getRandomName = require('./getRandomName').main;

module.exports.main = async (
  registryUri,
  privateKey1,
  publicKey1,
  nonce,
  bagsToCreate
) => {
  const newNonce = uuidv4().replace(/-/g, '');

  const timestamp = new Date().getTime();
  const pd = await prepareDeploy(
    process.env.READ_ONLY_HOST,
    publicKey1,
    timestamp
  );

  const payload = {
    bags: {
      ['0']: {
        nonce: uuidv4().replace(/-/g, ''),
        publicKey: publicKey1,
        n: '0',
        price: 1,
        quantity: 1000000000000,
      },
    },
    data: {},
    nonce: nonce,
    newNonce: newNonce,
  };
  for (let i = 0; i < bagsToCreate - 1; i += 1) {
    payload.bags[getRandomName()] = {
      nonce: uuidv4().replace(/-/g, ''),
      publicKey: publicKey1,
      n: '0',
      price: 1,
      quantity: 1,
    };
  }

  const ba = rc.utils.toByteArray(payload);
  const signature = generateSignature(ba, privateKey1);
  const term = createTokensTerm(registryUri, payload, signature);
  console.log('  03 deploy is ' + Buffer.from(term).length / 1000000 + 'mb');
  const vab = await validAfterBlockNumber(process.env.READ_ONLY_HOST);
  const deployOptions = await rc.utils.getDeployOptions(
    'secp256k1',
    timestamp,
    term,
    privateKey1,
    publicKey1,
    1,
    1000000000,
    vab
  );

  try {
    const deployResponse = await rc.http.deploy(
      process.env.VALIDATOR_HOST,
      deployOptions
    );
    if (!deployResponse.startsWith('"Success!')) {
      console.log(deployResponse);
      throw new Error('03_createTokens 01');
    }
  } catch (err) {
    console.log(err);
    throw new Error('03_createTokens 02');
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
              throw new Error('03_createTokens 03');
            });
        } catch (err) {
          console.log(err);
          throw new Error('03_createTokens 04');
        }
      }, 15000);
    });
  } catch (err) {
    console.log(err);
    throw new Error('03_createTokens 05');
  }
  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  return;
};
