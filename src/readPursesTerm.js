
module.exports.readPursesTerm = (
  payload
) => {
  return `new return, entryCh, readCh, lookup(\`rho:registry:lookup\`) in {
  lookup!(\`rho:id:${payload.masterRegistryUri}\`, *entryCh) |
  for(entry <- entryCh) {
    new x in {
      entry!(("PUBLIC_READ_PURSES", { "contractId": "${payload.contractId}", "purseIds": Set(${payload.pursesIds
  .map((id) => '"' + id + '"')
  .join(',')}) }, *x)) |
      for (y <- x) {
        return!(*y)
      }
    }
  }
}`;
    }