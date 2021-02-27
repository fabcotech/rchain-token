const getAllBoxData = require('./getAllBoxData').main;

module.exports.main = async (
  boxRegistryUri,
  contractRegistryUri,
  pursesToCreate
) => {
  const allData = await getAllBoxData(boxRegistryUri);

  if (
    allData.purses[`rho:id:${contractRegistryUri}`].length !==
    pursesToCreate - 1
  ) {
    throw new Error('06_checkPursesInBox invalid purses');
  }
  return null;
};
