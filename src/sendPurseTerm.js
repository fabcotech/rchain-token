module.exports.sendPurseTerm = (
    registryUri,
  payload
) => {
  return `new basket,
  sendReturnCh,
  deletePurseReturnCh,
  boxCh,
  boxEntryCh,
  boxEntry2Ch,
  receivePursesReturnCh,
  receivePursesReturn2Ch,
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
        registryLookup!(\`rho:id:${payload.toBoxRegistryUri}\`, *boxEntryCh) |
        for (boxEntry <- boxEntryCh) {
          boxEntry!(("PUBLIC_RECEIVE_PURSE", 
            {
              "registryUri": \`rho:id:${registryUri}\`,
              "purse": purse,
            },
            *receivePursesReturnCh
          )) |
          for (r <- receivePursesReturnCh) {
            match *r {
              (true, Nil) => {
                match "rho:id:${payload.toBoxRegistryUri}" == "rho:id:${payload.fromBoxRegistryUri}" {
                  true => {
                    stdout!("completed, purse sent") |
                    basket!({ "status": "completed" })
                  }
                  false => {
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
              _ => {
                registryLookup!(\`rho:id:${payload.fromBoxRegistryUri}\`, *boxEntry2Ch) |
                for (boxEntry2 <- boxEntry2Ch) {
                  boxEntry!(("PUBLIC_RECEIVE_PURSE", 
                    {
                      "registryUri": \`rho:id:${registryUri}\`,
                      "purse": purse,
                    },
                    *receivePursesReturn2Ch
                  ))
                } |
                for (r2 <- receivePursesReturn2Ch) {
                  match *r2 {
                    String => {
                      stdout!("Failed to send, could not send back to emitter box, purse may be lost " ++ *r2 ++ *r) |
                      basket!({ "status": "failed", "message": "Failed to send, could not send back to emitter box, purse may be lost " ++ *r2 ++ *r})
                    }
                    _ => {
                      stdout!("Failed to send, could send back to emitter box" ++ *r2) |
                      basket!({ "status": "failed", "message": "Failed to send, could send back to emitter box" ++ *r2 })
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
