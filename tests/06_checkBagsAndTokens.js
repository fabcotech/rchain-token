const getAllData = require('./getAllData').main;

module.exports.main = async (registryUri, bagsToCreate, publicKey2) => {
  const allData = await getAllData(registryUri);

  if (
    (typeof allData.bags !== 'object' && typeof allData.bags !== 'function') ||
    allData.bags === null ||
    Object.keys(allData.bags).length !== bagsToCreate + 1
  ) {
    throw new Error('06_checkBagsAndTokens invalid bags');
  }

  if (allData.bags[`${bagsToCreate}`].publicKey !== publicKey2) {
    throw new Error(
      '06_checkBagsAndTokens invalid public key for bag bagsToCreate'
    );
  }

  if (allData.bags[`${bagsToCreate}`].quantity !== 1) {
    throw new Error(
      '06_checkBagsAndTokens invalid quantoty for bag bagsToCreate'
    );
  }

  if (allData.bags['1'].quantity !== 2) {
    throw new Error('06_checkBagsAndTokens invalid quantity for bag 1');
  }

  return allData.bags[`${bagsToCreate}`];
};
