const getAllBoxData = require('../tests-ft/getAllBoxData').main;

module.exports.main = async (masterRegistryUri, boxId, contractId, ids) => {
  const allData = await getAllBoxData(masterRegistryUri, boxId);

  if (
    allData.purses[contractId].filter((bid) => !!ids.find((id) => id === bid))
      .length !== ids.length
  ) {
    throw new Error('checkPursesInBox invalid purses');
  }
  return null;
};
