// rholang terms
const { deployBoxTerm } = require('./deployBoxTerm');
const { masterTerm } = require('./masterTerm');
const { deployTerm } = require('./deployTerm');
const { createPursesTerm } = require('./createPursesTerm');
const { lockTerm } = require('./lockTerm');
const { readPursesTerm } = require('./readPursesTerm');
const { readAllPursesTerm } = require('./readAllPursesTerm');
const { readBoxTerm } = require('./readBoxTerm');
const { readConfigTerm } = require('./readConfigTerm');
const { updatePurseDataTerm } = require('./updatePurseDataTerm');
const { readPursesDataTerm } = require('./readPursesDataTerm');
const { updatePursePriceTerm } = require('./updatePursePriceTerm');
const { purchaseTerm } = require('./purchaseTerm');
const { withdrawTerm } = require('./withdrawTerm');

// utils
const { decodePurses } = require('./decodePurses');

const { VERSION } = require('../constants');
module.exports = {
  version: VERSION,

  masterTerm,
  deployBoxTerm,
  deployTerm,
  createPursesTerm,
  lockTerm,
  updatePurseDataTerm,
  updatePursePriceTerm,
  purchaseTerm,
  withdrawTerm,

  readPursesTerm,
  readAllPursesTerm,
  readBoxTerm,
  readConfigTerm,
  readPursesDataTerm,

  // utils
  decodePurses,
};
