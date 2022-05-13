module.exports.createPursesTerm = (payload) => {
  const ids = Object.keys(payload.purses);
  ids.forEach((id) => {
    payload.purses[id].data = payload.data[id] || null;
  });

  let rholang = `new ${ids.map((id, i) => 'channel' + i)} in {`;
  ids.forEach((id, i) => {
    rholang +=
      '\n' +
      `superKey!(("CREATE_PURSE", ${JSON.stringify(payload.purses[id]).replace(
        new RegExp(': null|:null', 'g'),
        ': Nil'
      )}, *channel${i})) |`;
  });
  rholang += '\n';
  rholang += `for (${ids
    .map((p, i) => '@value' + i + ' <- channel' + i)
    .join('; ')}) {\n`;
  rholang += `  // OP_CREATE_PURSES_COMPLETED_BEGIN\n   stdout!("purses created, check results to see successes/failures") |
  deployId!({ "status": "completed", "results": {}${ids
    .map((p, i) => `.union({ "${p}": value${i} })`)
    .join('')}}) // OP_CREATE_PURSES_COMPLETED_END\n`;
  rholang += `}\n}`;

  return `new deployId(\`rho:rchain:deployId\`), entryCh, readCh, stdout(\`rho:io:stdout\`), deployerId(\`rho:rchain:deployerId\`), lookup(\`rho:registry:lookup\`) in {
    for (superKey <<- @(*deployerId, "rchain-token-contract", "${payload.masterRegistryUri}", "${payload.contractId}")) {
      ${rholang}
    }
  }`;
};
