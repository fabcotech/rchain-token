/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.withdrawTerm = (
  payload
) => {
  return `new deployId(\`rho:rchain:deployId\`),
  withdrawReturnCh,
  boxCh,
  stdout(\`rho:io:stdout\`),
  deployerId(\`rho:rchain:deployerId\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  for (boxCh <<- @(*deployerId, "rchain-token-box", "${payload.masterRegistryUri}", "${payload.boxId}")) {
    boxCh!(("WITHDRAW", { "contractId": "${payload.contractId}", "quantity": ${payload.withdrawQuantity}, "toBoxId": "${payload.toBoxId}", "purseId": "${payload.purseId}", "merge": ${payload.merge} }, *withdrawReturnCh)) |
    for (@r <- withdrawReturnCh) {
      match r {
        String => {
          deployId!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        _ => {
          // OP_WITHDRAW_COMPLETED_BEGIN
          deployId!({ "status": "completed" }) |
          stdout!("completed, withdraw successful")
          // OP_WITHDRAW_COMPLETED_END
        }
      }
    }
  }
}
`;
};
