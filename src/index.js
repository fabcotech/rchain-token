const { mainTerm } = require("./mainTerm");
const { createTokensTerm } = require("./createTokensTerm");
const { purchaseTokensTerm } = require("./purchaseTokensTerm");
const { sendTokensTerm } = require("./sendTokensTerm");
const { setLockedTerm } = require("./setLockedTerm");
const { updateTokenDataTerm } = require("./updateTokenDataTerm");
const { updateBagDataTerm } = require("./updateBagDataTerm");
const { readBagOrTokenDataTerm } = require("./readBagOrTokenDataTerm");
const { readBagsOrTokensDataTerm } = require("./readBagsOrTokensDataTerm");
const { read } = require("./read");
const { readBagsTerm } = require("./readBagsTerm");
const { changePriceTerm } = require("./changePriceTerm");

module.exports = {
  version: '4.0.0',
  mainTerm,
  createTokensTerm,
  purchaseTokensTerm,
  sendTokensTerm,
  setLockedTerm,
  updateTokenDataTerm,
  updateBagDataTerm,
  readBagOrTokenDataTerm,
  readBagsOrTokensDataTerm,
  read,
  readBagsTerm,
  changePriceTerm,
};
