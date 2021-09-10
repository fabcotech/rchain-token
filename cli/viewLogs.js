const rchainToolkit = require('rchain-toolkit');

const { readLogsTerm, logs } = require('../src');
const { getContractId, getMasterRegistryUri } = require('./utils');

module.exports.viewLogs = async () => {
  const masterRegistryUri = getMasterRegistryUri();
  const contractId = getContractId();
  const term0 = readLogsTerm({
    masterRegistryUri: masterRegistryUri,
    contractId: contractId,
  });
  const result0 = await rchainToolkit.http.exploreDeploy(
    process.env.READ_ONLY_HOST,
    {
      term: term0,
    }
  );
  const logss = rchainToolkit.utils.rhoValToJs(JSON.parse(result0).expr[0]);
  let lines = [];

  logss.split(';').forEach((l, i) => {
    try {
      logs.checkLine(l);
      lines.push(logs.formatLine(l));
    } catch (err) {}
  });

  console.log(lines.join('\n'));
};
