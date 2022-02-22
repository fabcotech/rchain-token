const { deployMaster } = require('./deployMaster');
const { deployBox } = require('./deployBox');
const { deploy } = require('./deploy');
const { createPurse } = require('./createPurse');
const { updatePursePrice } = require('./updatePursePrice');

module.exports = {
    deployMaster,
    deployBox,
    deploy,
    createPurse,
    updatePursePrice
};