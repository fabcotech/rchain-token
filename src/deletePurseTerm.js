/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.deletePurseTerm = (
  payload
) => {
  return `new basket,
  returnCh,
  stdout(\`rho:io:stdout\`),
  deployerId(\`rho:rchain:deployerId\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  for (superKey <<- @(*deployerId, "rchain-token-contract", "${payload.masterRegistryUri}", "${payload.contractId}")) {
    superKey!((
      "DELETE_PURSE",
      { "purseId": "${payload.purseId}" },
      *returnCh
    )) |
    for (@r <- returnCh) {
      match r {
        String => {
          basket!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        _ => {
          // OP_DELETE_PURSE_COMPLETED_BEGIN
          stdout!("completed, purse deleted") |
          basket!({ "status": "completed" })
          // OP_DELETE_PURSE_COMPLETED_END
        }
      }
    }
  }
}
`;
};
