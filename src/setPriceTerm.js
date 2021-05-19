module.exports.setPriceTerm = (
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
        @purse!(("SET_PRICE", ${payload.price || "Nil"}, *sendReturnCh)) |
        for (r <- sendReturnCh) {
          match *r {
            String => {
              basket!({ "status": "failed", "message": *r }) |
              stdout!(("failed", *r))
            }
            _ => {
              stdout!("completed, price set") |
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
