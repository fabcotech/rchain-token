
module.exports.readTerm = (
  registryUri
) => {
  return `new return, entryCh, readCh, lookup(\`rho:registry:lookup\`) in {
  lookup!(\`rho:id:${registryUri}\`, *entryCh) |
  for(entry <- entryCh) {
    new x in {
      entry!(("PUBLIC_READ", Nil, *x)) |
      for (y <- x) {
        return!(*y)
      }
    }
  }
}`;
};
