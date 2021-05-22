const getAllData = require('./getAllData').main;

module.exports.main = async (masterRegistryUri, contractId, length, id, quantity) => {
  const allData = await getAllData(masterRegistryUri, contractId);

  if (
    Object.keys(allData.purses).length !== length ||
    allData.purses[id].quantity !== quantity
  ) {
    throw new Error('checkPursesInContract invalid purses');
  }
  return null;
};
