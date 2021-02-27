const getBoxData = require('./getBoxData').main;

module.exports.main = async (
  boxRegistryUri,
  contractRegistryUri,
  bagsToCreate
) => {
  const boxData = await getBoxData(boxRegistryUri);

  if (
    (typeof boxData !== 'object' && typeof boxData !== 'function') ||
    boxData === null
  ) {
    throw new Error('04_checkKeysInBox invalid box data');
  }

  if (boxData.keys[`rho:id:${contractRegistryUri}`].length !== bagsToCreate) {
    throw new Error('04_checkKeysInBox invalid box keys');
  }

  if (!boxData.superKeys.includes(`rho:id:${contractRegistryUri}`)) {
    throw new Error('04_checkKeysInBox invalid box superKeys');
  }

  return null;
};
