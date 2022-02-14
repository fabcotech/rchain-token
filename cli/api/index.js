const { deployMaster } = require('./deployMaster');
const { deployBox } = require('./deployBox');
const { deploy } = require('./deploy');
const { createPurse } = require('./createPurse');

module.exports = {
    deployMaster,
    deployBox,
    deploy,
    createPurse,
};