const getAllData = require('./getAllData').main;

module.exports.main = async (masterRegistryUri, contractId, purseId, price) => {
  const allData = await getAllData(masterRegistryUri, contractId);

  if (price) {
    if (allData.purses[purseId].price[0] !== price[0]) {
      console.log('expected', price.join(', '));
      console.log('got', allData.purses[purseId].price.join(', '));
      throw new Error('checkPursePriceInContract invalid price for purse');
    }
    if (allData.purses[purseId].price[1] !== price[1]) {
      console.log('expected', price.join(', '));
      console.log('got', allData.purses[purseId].price.join(', '));
      throw new Error('checkPursePriceInContract invalid price for purse');
    }
  } else {
    if (allData.purses[purseId].price !== price) {
      throw new Error('checkPursePriceInContract invalid price for purse');
    }
  }
  return null;
};
