const getAllBoxData = require('./getAllBoxData').main;

module.exports.main = async (masterRegistryUri, boxId) => {
  const allData = await getAllBoxData(masterRegistryUri, boxId);

  if (
    (typeof allData.purses !== 'object' &&
      typeof allData.purses !== 'function') ||
    allData.purses === null ||
    Object.keys(allData.purses).length !== 0
  ) {
    throw new Error('01_checkDefaultPurses invalid purses');
  }

  return null;
};
