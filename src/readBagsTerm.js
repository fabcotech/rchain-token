module.exports.readBagsTerm = (
  registryUri
) => {
  return `new return, entryCh, readCh, lookup(\`rho:registry:lookup\`) in {
    lookup!(\`rho:id:${registryUri}\`, *entryCh) |
    for(entry <- entryCh) {
      new x in {
        entry!({ "type": "READ_BAGS" }, *x) |
        for (y <- x) {
          return!(*y)
        }
      }
    }
  }`;
};