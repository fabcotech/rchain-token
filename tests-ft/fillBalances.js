const rc = require('rchain-toolkit');

const getBalance = require('./getBalance').main;
module.exports.main = async (privateKey, pk1, pk2, pk3) => {
  const b1 = await getBalance(pk1);
  if (b1 < 12000000000) {
    throw new Error('public key 1 needs 120 REV for test to proceed')
  }
  const b2 = await getBalance(pk2);
  if (b2 < 400000000) {
    console.log('Sending 4 REVs to public key 2')
    await rc.http.easyDeploy(
      process.env.VALIDATOR_HOST,
      rc.utils.transferRevTerm({
        from: rc.utils.revAddressFromPublicKey(pk1),
        to: rc.utils.revAddressFromPublicKey(pk2),
        amount: 1000000000,
      }),
      privateKey,
      1,
      100000000,
      240000
    );
  }
  const b3 = await getBalance(pk3);
  if (b3 < 400000000) {
    console.log('Sending 4 REVs to public key 3')
    await rc.http.easyDeploy(
      process.env.VALIDATOR_HOST,
      rc.utils.transferRevTerm({
        from: rc.utils.revAddressFromPublicKey(pk1),
        to: rc.utils.revAddressFromPublicKey(pk3),
        amount: 1000000000,
      }),
      privateKey,
      1,
      100000000,
      240000
    );
  }
};
