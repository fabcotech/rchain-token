module.exports.updatePurseDataTerm = (
    registryUri,
  payload
) => {
  return `new basket,
  returnCh,
  deletePurseReturnCh,
  boxCh,
  stdout(\`rho:io:stdout\`),
  deployerId(\`rho:rchain:deployerId\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  @(*deployerId, "rho:id:${payload.fromBoxRegistryUri}")!(({ "type": "READ_PURSES" }, *boxCh)) |

  for (purses <- boxCh) {
    match *purses.get(\`rho:id:${registryUri}\`).get("${payload.purseId}") {
      Nil => {
        basket!({ "status": "failed", "message": "purse not found" }) |
        stdout!(("failed", "purse not found"))
      }
      purse => {
        @(purse, "UPDATE_DATA")!(("${payload.data}", *returnCh)) |
        for (r <- returnCh) {
          match *r {
            String => {
              basket!({ "status": "failed", "message": *r }) |
              stdout!(("failed", *r))
            }
            _ => {
              stdout!("completed, purse data updated") |
              basket!({ "status": "completed" })
            }
          }
        }
      }
    }
  }
}
`;
};
