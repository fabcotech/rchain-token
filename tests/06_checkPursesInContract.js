const getAllData = require('./getAllData').main;

module.exports.main = async (registryUri, pursesToCreate) => {
  const allData = await getAllData(registryUri);

  const ids = [];
  for (let i = pursesToCreate + 1; i < pursesToCreate * 2 + 1; i += 1) {
    ids.push('' + i);
  }

  if (
    Object.keys(allData.purses).length !== pursesToCreate ||
    ids.filter((id) => !!Object.keys(allData.purses).find((pid) => pid === id))
      .length !== pursesToCreate
  ) {
    throw new Error('06_checkPursesInContract invalid purses');
  }
  return null;
};
