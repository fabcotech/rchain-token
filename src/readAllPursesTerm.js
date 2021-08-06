module.exports.readAllPursesTerm = (payload) => {
  const base = 12;
  let numberOfIndexes = 0;
  if (payload.depth === 1) {
    numberOfIndexes = base;
  } else if (payload.depth === 2) {
    numberOfIndexes = base * base;
  } else if (payload.depth === 3) {
    numberOfIndexes = base * base * base;
  } else if (payload.depth === 4) {
    numberOfIndexes = base * base * base * base;
  } else if (payload.depth === 5) {
    numberOfIndexes = base * base * base * base * base;
  } else {
    throw new error('depth should be > 0 and < 6');
  }

  const indexes = [];
  for (let i = 0; i < numberOfIndexes; i += 1) {
    indexes.push(i);
  }

  let rholang = `new ${indexes.map((i) => 'channel' + i).join(', ')} in {`;
  indexes.forEach((i) => {
    rholang +=
      '\n' +
      `entry!(("PUBLIC_READ_PURSES_AT_INDEX", "${payload.contractId}", ${i}, *channel${i})) |`;
  });
  rholang += '\n';
  rholang += `for (${indexes
    .map((i) => '@value' + i + ' <- channel' + i)
    .join('; ')}) {\n`;
  rholang += `  return!({}${indexes
    .map((i) => `.union(value${i})`)
    .join('')})\n`;
  rholang += `}\n}`;

  return `new return, entryCh, readCh, lookup(\`rho:registry:lookup\`) in {
  lookup!(\`rho:id:${payload.masterRegistryUri}\`, *entryCh) |
  for(entry <- entryCh) {
    ${rholang}
  }
}`;
};
