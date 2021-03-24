const getAllData = require('./getAllData').main;

module.exports.main = async (registryUri, id, price) => {
  const allData = await getAllData(registryUri);

  if (allData.purses[id].price !== price) {
    throw new Error('checkPursePriceInContract invalid price for purse');
  }
  return null;
};
