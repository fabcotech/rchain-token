module.exports.readPursesTerm = (payload) => {
  if (payload.pursesIds.length === 0) {
    return `new return in { return!({}) }`;
  }
  let rholang = `new ${payload.pursesIds.map((id, i) => 'channel' + i)} in {`;
  payload.pursesIds.forEach((p, i) => {
    rholang +=
      '\n' +
      `entry!(("PUBLIC_READ_PURSE", { "contractId": "${payload.contractId}", "purseId": "${p}" }, *channel${i})) |`;
  });
  rholang += '\n';
  rholang += `for (${payload.pursesIds
    .map((p, i) => '@value' + i + ' <- channel' + i)
    .join('; ')}) {\n`;
  rholang += `  return!({}${payload.pursesIds
    .map((p, i) => `.union({ "${p}": value${i} })`)
    .join('')})\n`;
  rholang += `}\n}`;

  return `new return, entryCh, readCh, lookup(\`rho:registry:lookup\`) in {
  lookup!(\`rho:id:${payload.masterRegistryUri}\`, *entryCh) |
  for(entry <- entryCh) {
    ${rholang}
  }
}`;
};
