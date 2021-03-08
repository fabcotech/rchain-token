module.exports.withdrawTerm = (
    registryUri,
  payload
) => {
  return `new basket,
  withdrawReturnCh,
  savePurseReturnCh,
  boxCh,
  readReturnCh,
  receivePursesReturnCh,
  receivePursesReturn2Ch,
  boxEntryCh,
  boxEntry2Ch,
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
        @(purse, "WITHDRAW")!((${payload.quantityToWithdraw}, *withdrawReturnCh)) |
        for (r <- withdrawReturnCh) {
          match *r {
            String => {
              basket!({ "status": "failed", "message": *r }) |
              stdout!(("failed", *r))
            }
            (true, newPurse) => {
              registryLookup!(\`rho:id:${payload.toBoxRegistryUri}\`, *boxEntryCh) |
              for (boxEntry <- boxEntryCh) {
                @(*boxEntry, "PUBLIC_RECEIVE_PURSE")!((
                  {
                    "registryUri": \`rho:id:${registryUri}\`,
                    "purse": newPurse,
                  },
                  *receivePursesReturnCh
                ))
              } |
              for (r <- receivePursesReturnCh) {
                match *r {
                  (true, Nil) => {
                    stdout!("Purse withdrawn") |
                    basket!({ "status": "completed", "message": "Purse withdrawn" })
                  }
                  _ => {
                    registryLookup!(\`rho:id:${payload.fromBoxRegistryUri}\`, *boxEntry2Ch) |
                    for (boxEntry2 <- boxEntry2Ch) {
                      @(*boxEntry2, "PUBLIC_RECEIVE_PURSE")!((
                        {
                          "registryUri": \`rho:id:${registryUri}\`,
                          "purse": newPurse,
                        },
                        *receivePursesReturnCh
                      ))
                    } |
                    for (r2 <- receivePursesReturn2Ch) {
                      match *r2 {
                        String => {
                          stdout!("Failed to withdraw to recipient box, could not withdrawn back to box " ++ *r2) |
                          basket!({ "status": "failed", "message": "Failed to withdraw to recipient box, could not withdrawn back to box " ++ *r2 })
                        }
                        _ => {
                          stdout!("Failed to withdraw to recipient box, withdrawn back to box") |
                          basket!({ "status": "failed", "message": "Failed to withdraw to recipient box, withdrawn back to box"})
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
  }
}
`;
};
