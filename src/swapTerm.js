/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.swapTerm = (
  payload
) => {
  return `new deployId(\`rho:rchain:deployId\`),
  returnCh,
  boxCh,
  stdout(\`rho:io:stdout\`),
  deployerId(\`rho:rchain:deployerId\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  for (boxCh <<- @(*deployerId, "rchain-token-box", "${payload.masterRegistryUri}", "${payload.boxId}")) {
    boxCh!(("SWAP", { "contractId": "${payload.contractId}", "purseId": "${payload.purseId}", "merge": ${payload.merge}, "quantity": ${payload.quantity}, "newId": "${payload.newId ? payload.newId : ""}" }, *returnCh)) |
    for (@r <- returnCh) {
      match r {
        String => {
          deployId!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        (true, Nil) => {
          // OP_SWAP_BEGIN
          deployId!({ "status": "completed" }) |
          stdout!("completed, swap successful")
          // OP_SWAP_END
        }
      }
    }
  }
}
`;
};
