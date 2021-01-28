const getAllData = require('./getAllData').main;

module.exports.main = async (registryUri, bagsToCreate) => {
  const allData = await getAllData(registryUri);

  if (
    (typeof allData.bags !== 'object' && typeof allData.bags !== 'function') ||
    allData.bags === null ||
    Object.keys(allData.bags).length !== bagsToCreate
  ) {
    throw new Error('04_checkBagsAndTokens invalid bags');
  }

  return null;
};
