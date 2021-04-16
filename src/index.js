const { boxTerm } = require('./boxTerm');
const { mainTerm } = require('./mainTerm');
const { createPursesTerm } = require('./createPursesTerm');
const { sendPurseTerm } = require('./sendPurseTerm');
const { readPursesTerm } = require('./readPursesTerm');
const { readAllPursesTerm } = require('./readAllPursesTerm');
const { readPursesIdsTerm } = require('./readPursesIdsTerm');
const { readBoxTerm } = require('./readBoxTerm');
const { readTerm } = require('./readTerm');
const { updatePurseDataTerm } = require('./updatePurseDataTerm');
const { readPursesDataTerm } = require('./readPursesDataTerm');
const { splitPurseTerm } = require('./splitPurseTerm');
const { setPriceTerm } = require('./setPriceTerm');
const { purchaseTerm } = require('./purchaseTerm');
const { withdrawTerm } = require('./withdrawTerm');

module.exports = {
  version: '5.0.3',
  boxTerm,
  mainTerm,
  createPursesTerm,
  sendPurseTerm,
  readPursesTerm,
  readAllPursesTerm,
  readPursesIdsTerm,
  readBoxTerm,
  readTerm,
  updatePurseDataTerm,
  readPursesDataTerm,
  splitPurseTerm,
  setPriceTerm,
  purchaseTerm,
  withdrawTerm,
};
