/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.updatePursePriceTerm = (
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
    boxCh!(("UPDATE_PURSE_PRICE", { "contractId": "${payload.contractId}", "price": ${payload.price ? "(" + payload.price + ")": "Nil"}, "purseId": "${payload.purseId}" }, *returnCh)) |
    for (@r <- returnCh) {
      match r {
        String => {
          deployId!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        _ => {
          // OP_UPDATE_PURSE_PRICE_COMPLETED_BEGIN
          deployId!({ "status": "completed" }) |
          stdout!("completed, price updated")
          // OP_UPDATE_PURSE_PRICE_COMPLETED_END
        }
      }
    }
  }
}
`;
};
