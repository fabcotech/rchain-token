const getAllData = require('./getAllData').main;

module.exports.main = async (registryUri, bagsToCreate, publicKey2, bagId) => {
  const allData = await getAllData(registryUri);

  if (
    (typeof allData.bags !== 'object' && typeof allData.bags !== 'function') ||
    allData.bags === null ||
    Object.keys(allData.bags).length !== bagsToCreate + 1
  ) {
    throw new Error('06_checkBagsAndTokens invalid bags');
  }

  if (allData.bags[`${bagId}`].publicKey !== publicKey2) {
    throw new Error(
      '06_checkBagsAndTokens invalid public key for bag bagsToCreate'
    );
  }

  if (allData.bags[`${bagId}`].quantity !== 1) {
    throw new Error(
      '06_checkBagsAndTokens invalid quantoty for bag bagsToCreate'
    );
  }

  return allData.bags[bagId];
};
