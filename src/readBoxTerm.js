/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.readBoxTerm = (
  payload
) => {
  return `new return, entryCh, lookup(\`rho:registry:lookup\`), stdout(\`rho:io:stdout\`) in {
  lookup!(\`rho:id:${payload.masterRegistryUri}\`, *entryCh) |
  for(entry <- entryCh) {
    new a in {
      entry!(("PUBLIC_READ_BOX", "${payload.boxId}", *a)) |
      for (@box <- a) {
        return!(box)
      }
    }
  }
}`;
};
