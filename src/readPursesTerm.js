
module.exports.readPursesTerm = (
  registryUri,
  payload
) => {
  return `new return, entryCh, readCh, lookup(\`rho:registry:lookup\`) in {
  lookup!(\`rho:id:${registryUri}\`, *entryCh) |
  for(entry <- entryCh) {
    new x in {
      @(*entry, "READ_PURSES")!((Set(${payload.pursesIds
  .map((id) => '"' + id + '"')
  .join(',')}), *x)) |
      for (y <- x) {
        return!(*y)
      }
    }
  }
}`;
    }