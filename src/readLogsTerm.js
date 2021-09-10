/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.readLogsTerm = (
  payload
) => {
  return `new return, entryCh, lookup(\`rho:registry:lookup\`), stdout(\`rho:io:stdout\`) in {
  lookup!(\`rho:id:${payload.masterRegistryUri}\`, *entryCh) |
  for(entry <- entryCh) {
    new a in {
      entry!(("PUBLIC_READ_LOGS", "${payload.contractId}", *a)) |
      for (@logs <- a) {
        match logs {
          String => {
            return!("")
          }
          (true, logss) => {
            return!(logss)
          }
        }
      }
    }
  }
}`;
};
