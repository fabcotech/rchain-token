const getAllBoxData = require('./getAllBoxData').main;

module.exports.main = async (boxRegistryUri, contractRegistryUri, id) => {
  const allData = await getAllBoxData(boxRegistryUri);

  if (id === 'none') {
    if (allData.purses[`rho:id:${contractRegistryUri}`].length > 0) {
      throw new Error('checkPursesInBox invalid purses (1)');
    }
  } else if (!allData.purses[`rho:id:${contractRegistryUri}`].includes(id)) {
    throw new Error('checkPursesInBox invalid purses (2)');
  }
  return null;
};
