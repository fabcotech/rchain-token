const getAllBoxData = require('./getAllBoxData').main;

module.exports.main = async (boxRegistryUri, registryUri) => {
  const allData = await getAllBoxData(boxRegistryUri);

  if (allData.purses[`rho:id:${registryUri}`].length !== 1) {
    throw new Error('07_checkPursesInBox invalid purses');
  }
  return null;
};
