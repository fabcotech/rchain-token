const getAllData = require('./getAllData').main;

module.exports.main = async (registryUri, bagId) => {
  const allData = await getAllData(registryUri);

  if (allData.bags[bagId].price !== 12) {
    throw new Error('12_checkBagPrice invalid bag price');
  }

  return allData.bags[bagId];
};
