const getAllBoxData = require('../tests-fungible/getAllBoxData').main;

module.exports.main = async (boxRegistryUri, contractRegistryUri, ids) => {
  const allData = await getAllBoxData(boxRegistryUri);

  if (
    allData.purses[`rho:id:${contractRegistryUri}`].filter(
      (bid) => !!ids.find((id) => id === bid)
    ).length !== ids.length
  ) {
    throw new Error('checkPursesInBox invalid purses');
  }
  return null;
};
