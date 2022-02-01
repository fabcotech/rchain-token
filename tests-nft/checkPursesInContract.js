const getAllData = require('../tests-ft/getAllData').main;

module.exports.main = async (masterRegistryUri, contractId, ids) => {
  const allData = await getAllData(masterRegistryUri, contractId);

  if (
    Object.keys(allData.purses).filter((bid) => !!ids.find((id) => id === bid))
      .length !== ids.length
  ) {
    console.log('ids', ids.join(' '))
    console.log('Object.ke...lnegth', Object.keys(allData.purses).join(' '))
    console.log('ids.length', ids.length)
    console.log(JSON.stringify(allData, null, 1))
    throw new Error('checkPursesInContract invalid purses');
  }
  return null;
};
