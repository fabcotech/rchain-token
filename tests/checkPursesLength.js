const getAllBoxData = require('./getAllBoxData').main;

module.exports.main = async (boxRegistryUri, registryUri, length) => {
  const allData = await getAllBoxData(boxRegistryUri);

  if (allData.purses[`rho:id:${registryUri}`].length !== length) {
    throw new Error('08_checkPursesInBox invalid purses');
  }
  return null;
};
