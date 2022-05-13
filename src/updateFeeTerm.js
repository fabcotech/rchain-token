/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.updateFeeTerm = (
  payload
) => {
  return `new deployId(\`rho:rchain:deployId\`),
  returnCh,
  stdout(\`rho:io:stdout\`),
  deployerId(\`rho:rchain:deployerId\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  for (superKey <<- @(*deployerId, "rchain-token-contract", "${payload.masterRegistryUri}", "${payload.contractId}")) {
    superKey!((
      "UPDATE_FEE",
      { "fee": ${payload.fee ? `("${payload.fee[0]}", ${payload.fee[1]})` : "Nil"} },
      *returnCh
    )) |
    for (@r <- returnCh) {
      stdout!(r) |
      match r {
        String => {
          deployId!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        _ => {
          // OP_UPDATE_FEE_COMPLETED_BEGIN
          stdout!("completed, fee updated") |
          deployId!({ "status": "completed" })
          // OP_UPDATE_FEE_COMPLETED_END
        }
      }
    }
  }
}
`;
};
