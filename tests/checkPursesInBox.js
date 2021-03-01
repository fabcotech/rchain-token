const getAllBoxData = require('./getAllBoxData').main;

module.exports.main = async (boxRegistryUri, contractRegistryUri, length) => {
  const allData = await getAllBoxData(boxRegistryUri);

  if (allData.purses[`rho:id:${contractRegistryUri}`].length !== length) {
    throw new Error('checkPursesInBox invalid purses');
  }
  return null;
};
