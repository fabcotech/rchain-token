const getAllBoxData = require('../ft/getAllBoxData').main;

module.exports.main = async (masterRegistryUri, boxId, contractId, ids) => {
  const allData = await getAllBoxData(masterRegistryUri, boxId);

  if (
    allData.purses[contractId].filter((bid) => !!ids.find((id) => id === bid))
      .length !== ids.length
  ) {
    console.log('purses:');
    console.log(JSON.stringify(allData.purses[contractId]));
    console.log('expected purses:');
    console.log(ids);
    throw new Error('checkPursesInBox invalid purses');
  }
  return null;
};
