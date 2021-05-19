
module.exports.readAllPursesTerm = (
  payload
) => {
  return `new return, entryCh, readCh, lookup(\`rho:registry:lookup\`) in {
  lookup!(\`rho:id:${payload.masterRegistryUri}\`, *entryCh) |
  for(entry <- entryCh) {
    new x in {
      entry!(("PUBLIC_READ_ALL_PURSES", { "contractId": "${payload.contractId}"}, *x)) |
      for (y <- x) {
        return!(*y)
      }
    }
  }
}`;
    }