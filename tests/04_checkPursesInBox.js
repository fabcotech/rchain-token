const getAllBoxData = require('./getAllBoxData').main;

module.exports.main = async (boxRegistryUri, registryUri, pursesToCreate) => {
  const allData = await getAllBoxData(boxRegistryUri);
  const ids = [];
  for (let i = pursesToCreate; i < pursesToCreate * 2; i += 1) {
    ids.push('' + i);
  }

  if (
    allData.purses[`rho:id:${registryUri}`].length !== pursesToCreate ||
    ids.filter(
      (id) =>
        !!allData.purses[`rho:id:${registryUri}`].find((pid) => pid === id)
    ).length !== pursesToCreate
  ) {
    throw new Error('04_checkPursesInBox invalid purses');
  }
  return null;
};
