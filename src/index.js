// rholang terms
const { boxTerm } = require('./boxTerm');
const { deployBoxTerm } = require('./deployBoxTerm');
const { mainTerm } = require('./mainTerm');
const { masterTerm } = require('./masterTerm');
const { deployTerm } = require('./deployTerm');
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

// utils
const { decodePurses } = require('./decodePurses');

const { VERSION } = require('../constants');
module.exports = {
  version: VERSION,
  // rholang terms
  boxTerm,
  mainTerm,
  deployBoxTerm,
  masterTerm,
  deployTerm,
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

  // utils
  decodePurses,
};
