module.exports.createPursesTerm = (
  registryUri,
  payload
) => {
  return `new basket,
  returnCh,
  listenAgainOnReturnCh,
  processPurseCh,
  listenManyTimesCh,
  boxCh,
  stdout(\`rho:io:stdout\`),
  deployerId(\`rho:rchain:deployerId\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  @(*deployerId, "rho:id:${payload.fromBoxRegistryUri}")!(({ "type": "READ_SUPER_KEYS" }, *boxCh)) |

  for (superKeys <- boxCh) {
    match *superKeys.get(\`rho:id:${registryUri}\`) {
      superKey => {
        @(superKey, "CREATE_PURSES")!((
          {
            // example
            // "purses": { "0": { "publicKey": "abc", "box": \`rho:id:abc\`, "type": "gold", "quantity": 3, "data": Nil }}
            "purses": ${JSON.stringify(payload.purses).replace(new RegExp(': null|:null', 'g'), ': Nil')
        .split('"$BQ').join('`')
        .split('$BQ"').join('`')},
            // example
            // "data": { "0": "this bag is mine" }
            "data": ${JSON.stringify(payload.data).replace(new RegExp(': null|:null', 'g'), ': Nil')},
          },
          *returnCh
        ))
      }
    }
  } |

  for (@i <= listenAgainOnReturnCh) {
    for (@resp <- returnCh) {
      match resp {
        String => {
          basket!({ "status": "failed", "message": resp }) |
          stdout!(("failed", resp))
        }
        (true, result) => {
          if (i + 1 == result.get("total")) {
            processPurseCh!((result.get("purse"), Nil, true))
          } else {
            new createNextCh in {
              processPurseCh!((result.get("purse"), *createNextCh, false)) |
              for (_ <- createNextCh) {
                listenAgainOnReturnCh!(i + 1)
              }
            }
          }
        }
      }
    }
  } |
  listenAgainOnReturnCh!(0) |

  for (@(purse, createNextCh, last) <= processPurseCh) {
    new entryCh, return2Ch, itCh in {
      registryLookup!(\`rho:id:${payload.fromBoxRegistryUri}\`, *entryCh) |
      for (entry <- entryCh) {
        new readReturnCh, receivePurseReturnCh in {
          @purse!(("READ", Nil, *readReturnCh)) |
          entry!((
            "PUBLIC_RECEIVE_PURSE", {
              "registryUri": \`rho:id:${registryUri}\`,
              "purse": purse
            }, *receivePurseReturnCh)
          ) |
          for (r <- receivePurseReturnCh) {
            match *r {
              String => {
                basket!({ "status": "failed", "message": *r }) |
                stdout!(("failed", *r))
              }
              _ => {
                if (last == true) {
                  stdout!("completed, purses created and saved to box") |
                  basket!({ "status": "completed" })
                } else {
                  @createNextCh!(Nil)
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
