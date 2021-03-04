const { boxTerm } = require('./boxTerm');
const { mainTerm } = require('./mainTerm');
const { createPursesTerm } = require('./createPursesTerm');
const { sendPurseTerm } = require('./sendPurseTerm');
const { readPursesTerm } = require('./readPursesTerm');
const { readPursesIdsTerm } = require('./readPursesIdsTerm');
const { readBoxTerm } = require('./readBoxTerm');
const { readTerm } = require('./readTerm');
const { updatePurseDataTerm } = require('./updatePurseDataTerm');
const { readPursesDataTerm } = require('./readPursesDataTerm');
const { splitPurseTerm } = require('./splitPurseTerm');

module.exports = {
  version: '5.0.0',
  boxTerm,
  mainTerm,
  createPursesTerm,
  sendPurseTerm,
  readPursesTerm,
  readPursesIdsTerm,
  readBoxTerm,
  readTerm,
  updatePurseDataTerm,
  readPursesDataTerm,
  splitPurseTerm,
};
