const getAllData = require('./getAllData').main;

module.exports.main = async (masterRegistryUri, length, id, quantity) => {
  const allData = await getAllData(masterRegistryUri, "mytoken");
  console.log(allData)
  if (
    Object.keys(allData.purses).length !== length ||
    allData.purses[id].quantity !== quantity
  ) {
    throw new Error('checkPursesInContract invalid purses');
  }
  return null;
};
