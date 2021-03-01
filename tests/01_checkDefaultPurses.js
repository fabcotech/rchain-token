const getAllBoxData = require('./getAllBoxData').main;

module.exports.main = async (boxRegistryUri) => {
  const allData = await getAllBoxData(boxRegistryUri);

  if (
    (typeof allData.purses !== 'object' &&
      typeof allData.purses !== 'function') ||
    allData.purses === null ||
    Object.keys(allData.purses).length !== 0
  ) {
    throw new Error('01_checkDefaultPurses invalid bags');
  }

  return null;
};
