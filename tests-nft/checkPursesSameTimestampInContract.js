const getAllData = require('../tests-ft/getAllData').main;

module.exports.main = async (masterRegistryUri, contractId, ids) => {
  const allData = await getAllData(masterRegistryUri, contractId);

  const keys = Object.keys(allData.purses).filter(
    (bid) => !!ids.find((id) => id === bid)
  );
  const timestamps = {};
  keys.forEach((k) => {
    timestamps[allData.purses[k].timestamp] = true;
  });

  if (Object.keys(timestamps).length > 1) {
    throw new Error('there should be only one same timestamp');
  }
  return null;
};
