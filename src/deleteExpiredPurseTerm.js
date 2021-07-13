
module.exports.deleteExpiredPurseTerm = (
  payload
) => {
  return `new return, entryCh, readCh, lookup(\`rho:registry:lookup\`) in {
  lookup!(\`rho:id:${payload.masterRegistryUri}\`, *entryCh) |
  for(entry <- entryCh) {
    new x in {
      entry!(("PUBLIC_DELETE_EXPIRED_PURSE", "${payload.contractId}", "${payload.purseId}", *x)) |
      for (@y <- x) {
        match y {
          String => {
            basket!({ "status": "failed", "message": r }) |
            stdout!(("failed", r))
          }
          _ => {
            stdout!("completed, expired purses deleted") |
            basket!({ "status": "completed" })
          }
        }
      }
    }
  }
}`;
};
