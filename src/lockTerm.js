/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.lockTerm = (
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
      "LOCK",
      *returnCh
    )) |
    for (@r <- returnCh) {
      match r {
        String => {
          basket!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        _ => {
          stdout!("completed, contract locked") |
          basket!({ "status": "completed" })
        }
      }
    }
  }
}
`;
};
