const getAllData = require('./getAllData').main;

module.exports.main = async (registryUri, bagId) => {
  const allData = await getAllData(registryUri);

  if (allData.bagsData[bagId] !== 'aaa') {
    throw new Error('08_checkBagsAndTokens invalid bagData');
  }

  return null;
};
