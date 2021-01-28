const getAllData = require('./getAllData').main;

module.exports.main = async (registryUri, bagsToCreate) => {
  const allData = await getAllData(registryUri);

  if (allData.bagsData[`${bagsToCreate}`] !== 'aaa') {
    throw new Error('08_checkBagsAndTokens invalid bagData');
  }

  return null;
};
