/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.updatePurseDataTerm = (
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
    boxCh!(("UPDATE_PURSE_DATA", { "contractId": "${payload.contractId}", "data": "${payload.data}", "purseId": "${payload.purseId}" }, *returnCh)) |
    for (@r <- returnCh) {
      match r {
        String => {
          deployId!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        _ => {
          // OP_UPDATE_PURSE_DATA_COMPLETED_BEGIN
          deployId!({ "status": "completed" }) |
          stdout!("completed, data updated")
          // OP_UPDATE_PURSE_DATA_COMPLETED_END
        }
      }
    }
  }
}
`;
};
