
module.exports.readAllPursesTerm = (
  registryUri,
  payload
) => {
  return `new return, entryCh, readCh, lookup(\`rho:registry:lookup\`) in {
  lookup!(\`rho:id:${registryUri}\`, *entryCh) |
  for(entry <- entryCh) {
    new x in {
      entry!(("PUBLIC_READ_ALL_PURSES", Nil, *x)) |
      for (y <- x) {
        return!(*y)
      }
    }
  }
}`;
    }