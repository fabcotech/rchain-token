module.exports.readBagsOrTokensDataTerm = (
  registryUri,
  bagsOrTokens,
  bagsOrTokensIds
) => {
  return `new return, entryCh, readCh, lookup(\`rho:registry:lookup\`) in {
    lookup!(\`rho:id:${registryUri}\`, *entryCh) |
    for(entry <- entryCh) {
      new x in {
        entry!({
          "type": "${
            bagsOrTokens === 'tokens' ? 'READ_TOKENS_DATA' : 'READ_BAGS_DATA'
          }",
          "payload": Set(${bagsOrTokensIds.map((id) => `"${id}"`).join(',')})
        }, *x) |
        for (y <- x) {
          return!(*y)
        }
      }
    }
  }`;
};
