const getAllData = require('./getAllData').main;

module.exports.main = async (masterRegistryUri, contractId, purseId, data) => {
  const allData = await getAllData(masterRegistryUri, contractId);

  if (allData.pursesData[purseId] !== data) {
    throw new Error('checkPursesInContract invalid purses');
  }
  return null;
};
