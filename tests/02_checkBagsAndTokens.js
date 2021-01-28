const { readBagsTerm } = require('../src/readBagsTerm');
const { readBagsOrTokensDataTerm } = require('../src/readBagsOrTokensDataTerm');
const rc = require('rchain-toolkit');
const uuidv4 = require('uuid/v4');

const getAllData = require('./getAllData').main;

module.exports.main = async (registryUri) => {
  const allData = await getAllData(registryUri);

  if (
    (typeof allData.bags !== 'object' && typeof allData.bags !== 'function') ||
    allData.bags === null ||
    Object.keys(allData.bags).length !== 0
  ) {
    throw new Error('02_checkBagsAndTokens invalid bags');
  }
  if (
    (typeof allData.bagsData !== 'object' &&
      typeof allData.bagsData !== 'function') ||
    allData.bagsData === null ||
    Object.keys(allData.bagsData).length !== 0
  ) {
    throw new Error('02_checkBagsAndTokens invalid bagsData');
  }
  if (
    (typeof allData.tokensData !== 'object' &&
      typeof allData.tokensData !== 'function') ||
    allData.tokensData === null ||
    Object.keys(allData.tokensData).length !== 0
  ) {
    throw new Error('02_checkBagsAndTokens invalid tokensData');
  }

  return null;
};
