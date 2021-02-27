const getAllData = require('./getAllData').main;

module.exports.main = async (registryUri, pursesToCreate) => {
  const allData = await getAllData(registryUri);

  const ids = [];
  for (let i = pursesToCreate; i < pursesToCreate * 2; i += 1) {
    ids.push('' + i);
  }

  if (
    Object.keys(allData.purses).length !== pursesToCreate ||
    ids.filter((id) => !!Object.keys(allData.purses).find((pid) => pid === id))
      .length !== pursesToCreate
  ) {
    throw new Error('04_checkPursesInBox invalid purses');
  }
  return null;
};
