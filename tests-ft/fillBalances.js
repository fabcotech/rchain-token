const rc = require('rchain-toolkit');

const getBalance = require('./getBalance').main;

module.exports.main = async (privateKey, publicKey, pk2, pk3) => {
  const b2 = await getBalance(pk2);
  if (b2 === 0) {
    await rc.http.easyDeploy(
      process.env.READ_ONLY_HOST,
      rc.utils.transferRevTerm({
        from: rc.utils.revAddressFromPublicKey(publicKey),
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
  if (b3 === 0) {
    await rc.http.easyDeploy(
      process.env.READ_ONLY_HOST,
      rc.utils.transferRevTerm({
        from: rc.utils.revAddressFromPublicKey(publicKey),
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
