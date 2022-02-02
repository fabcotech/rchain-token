// rholang terms
const { deployBoxTerm } = require('./deployBoxTerm');
const { masterTerm } = require('./masterTerm');
const { swapTerm } = require('./swapTerm');
const { deployTerm } = require('./deployTerm');
const { createPursesTerm } = require('./createPursesTerm');
const { lockTerm } = require('./lockTerm');
const { updateFeeTerm } = require('./updateFeeTerm');
const { deleteExpiredPurseTerm } = require('./deleteExpiredPurseTerm');
const { deletePurseTerm } = require('./deletePurseTerm');
const { readPursesTerm } = require('./readPursesTerm');
const { readAllPursesTerm } = require('./readAllPursesTerm');
const { readBoxTerm } = require('./readBoxTerm');
const { readConfigTerm } = require('./readConfigTerm');
const { updatePurseDataTerm } = require('./updatePurseDataTerm');
const { readPursesDataTerm } = require('./readPursesDataTerm');
const { updatePursePriceTerm } = require('./updatePursePriceTerm');
const { renewTerm } = require('./renewTerm');
const { creditTerm } = require('./creditTerm');
const { withdrawTerm } = require('./withdrawTerm');
const { readLogsTerm } = require('./readLogsTerm');

// utils
const { decodePurses } = require('./decodePurses');
const { logs } = require('./logs');

const { VERSION } = require('../constants');

module.exports = {
  version: VERSION,

  masterTerm,
  swapTerm,
  deployBoxTerm,
  deployTerm,
  createPursesTerm,
  lockTerm,
  updateFeeTerm,
  deletePurseTerm,
  deleteExpiredPurseTerm,
  updatePurseDataTerm,
  updatePursePriceTerm,
  renewTerm,
  creditTerm,
  withdrawTerm,

  readPursesTerm,
  readAllPursesTerm,
  readBoxTerm,
  readLogsTerm,
  readConfigTerm,
  readPursesDataTerm,

  // utils
  decodePurses,
  logs: logs,
};
