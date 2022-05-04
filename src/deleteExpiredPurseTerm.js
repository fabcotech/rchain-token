/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.deleteExpiredPurseTerm = (
  payload
) => {
  return `new
  basket,
  entryCh,
  returnCh,
  registryLookup(\`rho:registry:lookup\`),
  stdout(\`rho:io:stdout\`)
in {
  registryLookup!(\`rho:id:${payload.masterRegistryUri}\`, *entryCh) |
  for(entry <- entryCh) {
    entry!(("PUBLIC_DELETE_EXPIRED_PURSE", "${payload.contractId}", "${payload.boxId}", "${payload.purseId}", *returnCh)) |
    for (@r <- returnCh) {
      match r {
        String => {
          basket!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        _ => {
          // OP_PUBLIC_DELETE_EXPIRED_PURSE_COMPLETED_BEGIN
          stdout!("completed, expired purses deleted") |
          basket!({ "status": "completed" })
          // OP_PUBLIC_DELETE_EXPIRED_PURSE_COMPLETED_END
        }
      }
    }
  }
}`;
};
