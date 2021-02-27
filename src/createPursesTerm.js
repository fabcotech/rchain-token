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
            // "purses": { "0": { "publicKey": "abc", "n": "gold", "quantity": 3, "data": Nil }}
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
        new entryCh, return2Ch in {
          registryLookup!(\`rho:id:${payload.fromBoxRegistryUri}\`, *entryCh) |
          for (entry <- entryCh) {
            @(*entry, "RECEIVE_PURSES")!((
              payload.set("registryUri", \`rho:id:${registryUri}\`),
              *return2Ch
            )) |
            for (r <- return2Ch) {
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
      }
    }
  }
}
`;
};
