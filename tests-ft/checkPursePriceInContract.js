const getAllData = require('./getAllData').main;

module.exports.main = async (masterRegistryUri, contractId, purseId, price) => {
  const allData = await getAllData(masterRegistryUri, contractId);

  if (allData.purses[purseId].price !== price) {
    throw new Error('checkPursePriceInContract invalid price for purse');
  }
  return null;
};
