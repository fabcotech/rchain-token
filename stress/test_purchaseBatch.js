const rc = require('rchain-toolkit');

const { purchaseTerm } = require('../src');
const { validAfterBlockNumber, prepareDeploy } = require('../cli/utils');

module.exports.main = async (privateKey, publicKey, term) => {
  const timestamp = new Date().getTime();
  const pd = await prepareDeploy(
    process.env.READ_ONLY_HOST,
    publicKey,
    timestamp
  );

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
      throw new Error('07_updateBagData 01');
    }
  } catch (err) {
    console.log(err);
    throw new Error('07_updateBagData 02');
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
                resolve(dataAtNameResponse);
                clearInterval(interval);
              } else {
                console.log('  .');
              }
            })
            .catch((err) => {
              console.log(err);
              throw new Error('07_updateBagData 03');
            });
        } catch (err) {
          console.log(err);
          throw new Error('07_updateBagData 04');
        }
      }, 4000);
    });
  } catch (err) {
    console.log(err);
    throw new Error('07_updateBagData 05');
  }
  const data = rc.utils.rhoValToJs(
    JSON.parse(dataAtNameResponse).exprs[0].expr
  );

  return;
};
