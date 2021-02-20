module.exports.readBagsTerm = (registryUri, bagsIds) => {
  return `new return, entryCh, readCh, lookup(\`rho:registry:lookup\`) in {
    lookup!(\`rho:id:${registryUri}\`, *entryCh) |
    for(entry <- entryCh) {
      new x in {
        entry!({ "type": "READ_BAGS", "payload": Set(${bagsIds
          .map((id) => `"${id}"`)
          .join(',')}) }, *x) |
        for (y <- x) {
          return!(*y)
        }
      }
    }
  }`;
};
