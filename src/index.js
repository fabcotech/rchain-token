const { mainTerm } = require("./mainTerm");
const { createTokensTerm } = require("./createTokensTerm");
const { purchaseTokensTerm } = require("./purchaseTokensTerm");
const { sendTokensTerm } = require("./sendTokensTerm");
const { setLockedTerm } = require("./setLockedTerm");
const { updateTokenDataTerm } = require("./updateTokenDataTerm");
const { updateBagDataTerm } = require("./updateBagDataTerm");
const { readBagOrTokenDataTerm } = require("./readBagOrTokenDataTerm");
const { readBagsOrTokensDataTerm } = require("./readBagsOrTokensDataTerm");

module.exports = {
  mainTerm,
  createTokensTerm,
  purchaseTokensTerm,
  sendTokensTerm,
  setLockedTerm,
  updateTokenDataTerm,
  updateBagDataTerm,
  readBagOrTokenDataTerm,
  readBagsOrTokensDataTerm,
};
