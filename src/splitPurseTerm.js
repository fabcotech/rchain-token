module.exports.splitPurseTerm = (
    registryUri,
  payload
) => {
  return `new basket,
  withdrawReturnCh,
  savePurseReturnCh,
  boxCh,
  readReturnCh,
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
        @purse!(("WITHDRAW", ${payload.quantityInNewPurse}, *withdrawReturnCh)) |
        for (r <- withdrawReturnCh) {
          match *r {
            String => {
              basket!({ "status": "failed", "message": *r }) |
              stdout!(("failed", *r))
            }
            (true, newPurse) => {
              @newPurse!(("READ", Nil, *readReturnCh)) |
              for (@properties <- readReturnCh) {
                /*
                  Save new purse without joining it (DEPOSIT) to a purse with same type
                */
                @(*deployerId, "rho:id:${payload.fromBoxRegistryUri}")!((
                  { "type": "SAVE_PURSE_SEPARATELY", "payload": { "registryUri": \`rho:id:${registryUri}\`, "purse": newPurse } },
                  *savePurseReturnCh
                )) |
                for (r2 <- savePurseReturnCh) {
                  match *r2 {
                    String => {
                      stdout!("DANGER completed, purse split but could not save to box") |
                      basket!({ "status": "failed", "message": "DANGER completed, purse split but could not save to box" })
                    }
                    _ => {
                      stdout!("completed, purse split and saved in box") |
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
}
`;
};
