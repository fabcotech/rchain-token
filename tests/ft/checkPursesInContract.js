const getAllData = require('./getAllData').main;

module.exports.main = async (
  masterRegistryUri,
  contractId,
  length,
  id,
  quantity
) => {
  const allData = await getAllData(masterRegistryUri, contractId);

  if (
    Object.keys(allData.purses).length !== length ||
    allData.purses[id].quantity !== quantity
  ) {
    console.log('Object.keys(allData.purses).length', Object.keys(allData.purses).length)
    console.log('length', length)
    console.log('allData.purses[id].quantity', allData.purses[id].quantity)
    console.log('quantity', quantity)
    console.log(JSON.stringify(allData, null, 1))
    throw new Error('checkPursesInContract invalid purses');
  }
  return null;
};
