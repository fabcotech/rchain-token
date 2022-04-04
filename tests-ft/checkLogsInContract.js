const rc = require('@fabcotech/rchain-toolkit');
const { readLogsTerm } = require('../src/');

module.exports.main = async (masterRegistryUri, contractId, expectedLogs) => {
  const term0 = readLogsTerm({ masterRegistryUri, contractId });
  const t = new Date().getTime();
  const result0 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term0,
  });
  console.log(
    '  readLogs took',
    Math.round((new Date().getTime() - t) / 1000),
    'seconds'
  );

  let logs = rc.utils.rhoValToJs(JSON.parse(result0).expr[0]);
  let logsWithoutTimestamps = '';
  logs.split(';').forEach((l) => {
    if (!l) {
      return;
    }
    logsWithoutTimestamps +=
      l.split(',').slice(0, 1).concat(l.split(',').slice(2)).join(',') + ';';
  });
  if (logsWithoutTimestamps !== expectedLogs) {
    console.log('logs (without timestamp) :');
    console.log(logsWithoutTimestamps);
    console.log('expected logs :');
    console.log(expectedLogs);
    throw new Error('checkLogsInContract invalid logs');
  }

  return null;
};
