const getAllBoxData = require('../tests-ft/getAllBoxData').main;

module.exports.main = async (boxRegistryUri, contractRegistryUri, length) => {
  const allData = await getAllBoxData(boxRegistryUri);
  console.log(allData);
  if (allData.purses[`rho:id:${contractRegistryUri}`].length !== length) {
    throw new Error('checkPursesInBox invalid purses');
  }
  return null;
};
