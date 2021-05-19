const getAllBoxData = require('./getAllBoxData').main;

module.exports.main = async (masterRegistryUri, boxId, contractId, id) => {
  const allData = await getAllBoxData(masterRegistryUri, boxId);

  if (id === 'none') {
    if (allData.purses[contractId].length > 0) {
      throw new Error('checkPursesInBox invalid purses (1)');
    }
  } else if (!allData.purses[contractId].includes(id)) {
    throw new Error('checkPursesInBox invalid purses (2)');
  }
  return null;
};
