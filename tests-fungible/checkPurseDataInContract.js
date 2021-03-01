const getAllData = require('./getAllData').main;

module.exports.main = async (registryUri, id, data) => {
  const allData = await getAllData(registryUri);

  if (allData.pursesData[id] !== data) {
    throw new Error('checkPursesInContract invalid purses');
  }
  return null;
};
