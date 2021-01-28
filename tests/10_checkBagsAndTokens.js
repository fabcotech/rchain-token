const getAllData = require('./getAllData').main;

module.exports.main = async (registryUri, bagsToCreate) => {
  const allData = await getAllData(registryUri);

  if (
    (typeof allData.bags !== 'object' && typeof allData.bags !== 'function') ||
    allData.bags === null ||
    Object.keys(allData.bags).length !== bagsToCreate + 2
  ) {
    throw new Error('10_checkBagsAndTokens invalid bags');
  }

  if (allData.bags[`${bagsToCreate + 1}`].publicKey !== 'abc') {
    throw new Error(
      '10_checkBagsAndTokens invalid public key for bag bagsToCreate'
    );
  }

  if (allData.bags[`${bagsToCreate + 1}`].quantity !== 1) {
    throw new Error(
      '10_checkBagsAndTokens invalid quantoty for bag bagsToCreate'
    );
  }

  if (allData.bags[`1`].quantity !== 1) {
    throw new Error(
      '10_checkBagsAndTokens invalid quantoty for bag bagsToCreate'
    );
  }

  return allData.bags[`${bagsToCreate + 1}`];
};
