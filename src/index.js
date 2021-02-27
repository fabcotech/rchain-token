const { boxTerm } = require('./boxTerm');
const { mainTerm } = require('./mainTerm');
const { createPursesTerm } = require('./createPursesTerm');
const { sendPurseTerm } = require('./sendPurseTerm');
const { readPursesTerm } = require('./readPursesTerm');
const { readPursesIdsTerm } = require('./readPursesIdsTerm');
const { readBoxTerm } = require('./readBoxTerm');
const { readTerm } = require('./readTerm');

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
};
