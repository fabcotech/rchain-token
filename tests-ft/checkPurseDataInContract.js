const getAllData = require('./getAllData').main;

module.exports.main = async (masterRegistryUri, contractId, purseId, data) => {
  const allData = await getAllData(masterRegistryUri, contractId);

  if (allData.pursesData[purseId] !== data) {
    console.log('expected :')
    console.log(data)
    console.log('received :')
    console.log(allData.pursesData[purseId])
    throw new Error('checkPursesInContract invalid purses');
  }
  return null;
};
