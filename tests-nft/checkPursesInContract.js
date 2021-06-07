const getAllData = require('../tests-ft/getAllData').main;

module.exports.main = async (masterRegistryUri, contractId, ids) => {
  const allData = await getAllData(masterRegistryUri, contractId);

  if (
    Object.keys(allData.purses).filter((bid) => !!ids.find((id) => id === bid))
      .length !== ids.length
  ) {
    throw new Error('checkPursesInContract invalid purses');
  }
  return null;
};
