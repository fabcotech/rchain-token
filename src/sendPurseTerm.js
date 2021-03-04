module.exports.sendPurseTerm = (
    registryUri,
  payload
) => {
  return `new basket,
  sendReturnCh,
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
        @(purse, "SEND")!((\`rho:id:${payload.toBoxRegistryUri}\`, *sendReturnCh)) |
        for (r <- sendReturnCh) {
          match *r {
            String => {
              basket!({ "status": "failed", "message": *r }) |
              stdout!(("failed", *r))
            }
            _ => {
              /*
                Remove the purse from emitter's box now that it is worthless
              */
              @(*deployerId, "rho:id:${payload.fromBoxRegistryUri}")!((
                { "type": "DELETE_PURSE", "payload": { "registryUri": \`rho:id:${registryUri}\`, "id": "${payload.purseId}" } },
                *deletePurseReturnCh
              )) |
              for (r2 <- deletePurseReturnCh) {
                match *r2 {
                  String => {
                    stdout!("WARNING completed, purse sent but could not remove from box") |
                    basket!({ "status": "completed" })
                  }
                  _ => {
                    stdout!("completed, purse sent and removed from box") |
                    basket!({ "status": "completed" })
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`;
};
