/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.renewTerm = (
  payload
) => {
  return `
new
  deployId(\`rho:rchain:deployId\`),
  boxCh,
  returnCh,
  deployerId(\`rho:rchain:deployerId\`),
  stdout(\`rho:io:stdout\`)
in {

  for (boxCh <<- @(*deployerId, "rchain-token-box", "${payload.masterRegistryUri}", "${payload.boxId}")) {
    stdout!("boxCh") |
    boxCh!((
      "RENEW",
      {
        "contractId": "${payload.contractId}",
        "purseId": "${payload.purseId}"
      },
      *returnCh
    )) |
    for (@r <- returnCh) {
      match r {
        String => {
          deployId!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        (true, Nil) => {
          // OP_RENEW_COMPLETED_BEGIN
          deployId!({ "status": "completed" }) |
          stdout!("completed, renew successful")
          // OP_RENEW_COMPLETED_END
        }
      }
    }
  }
}`;
};
