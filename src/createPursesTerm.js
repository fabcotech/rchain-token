module.exports.createPursesTerm = (
  registryUri,
  payload
) => {
  return `new basket,
  returnCh,
  boxCh,
  stdout(\`rho:io:stdout\`),
  deployerId(\`rho:rchain:deployerId\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  @(*deployerId, "rho:id:${payload.fromBoxRegistryUri}")!({ "type": "READ_SUPER_KEYS" }, *boxCh) |

  for (superKeys <- boxCh) {
    match *superKeys.get(\`rho:id:${registryUri}\`) {
      ch => {
        @(ch, "CREATE_PURSES")!((
          {
            // example
            // "purses": { "0": { "publicKey": "abc", "type": "gold", "quantity": 3, "data": Nil }}
            "purses": ${JSON.stringify(payload.purses).replace(new RegExp(': null|:null', 'g'), ': Nil')},
            // example
            // "data": { "0": "this bag is mine" }
            "data": ${JSON.stringify(payload.data).replace(new RegExp(': null|:null', 'g'), ': Nil')},
          },
          *returnCh
        ))
      }
    }
  } |

  for (resp <- returnCh) {
    match *resp {
      String => {
        basket!({ "status": "failed", "message": *resp }) |
        stdout!(("failed", *resp))
      }
      (true, payload) => {
        new entryCh, return2Ch, itCh in {
          registryLookup!(\`rho:id:${payload.fromBoxRegistryUri}\`, *entryCh) |
          for (entry <- entryCh) {
            for (purses <= itCh) {
              match *purses {
                Nil => {
                  basket!({ "status": "failed", "message": "no purse" }) |
                  stdout!(("failed", "no purse"))
                }
                [last] => {
                  new readReturnCh, receivePurseReturnCh in {
                    @(last, "READ")!((Nil, *readReturnCh)) |
                    for (properties <- readReturnCh) {
                      @(*entry, "RECEIVE_PURSE")!(({
                        "registryUri": \`rho:id:${registryUri}\`,
                        "purse": last,
                        "fungible": payload.get("fungible"),
                        "type": *properties.get("type")
                      }, *receivePurseReturnCh))
                    } |
                    for (r <- receivePurseReturnCh) {
                      match *r {
                        String => {
                          basket!({ "status": "failed", "message": *r }) |
                          stdout!(("failed", *r))
                        }
                        _ => {
                          stdout!("completed, purses created and saved to box") |
                          basket!({ "status": "completed" })
                        }
                      }
                    }
                  }
                }
                [first ... rest] => {
                  new readReturnCh, receivePurseReturnCh in {
                    @(first, "READ")!((Nil, *readReturnCh)) |
                    for (properties <- readReturnCh) {
                      @(*entry, "RECEIVE_PURSE")!(({
                        "registryUri": \`rho:id:${registryUri}\`,
                        "purse": first,
                        "fungible": payload.get("fungible"),
                        "type": *properties.get("type")
                      }, *receivePurseReturnCh))
                    } |
                    for (r <- receivePurseReturnCh) {
                      match *r {
                        String => {
                          basket!({ "status": "failed", "message": *r }) |
                          stdout!(("failed", *r))
                        }
                        _ => { itCh!(rest) }
                      }
                    }
                  }
                }
              }
            } |
            itCh!(payload.get("purses"))
          }
        }
      }
    }
  }
}
`;
};
