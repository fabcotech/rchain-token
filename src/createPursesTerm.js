module.exports.createPursesTerm = (
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

  for (superKey <<- @(*deployerId, "rchain-token-contract", "${payload.masterRegistryUri}", "${payload.contractId}")) {
    stdout!(("superKey", *superKey)) |
    superKey!((
      "CREATE_PURSES",
      {
        // example
        // "purses": { "0": { "box": "abc", "type": "gold", "quantity": 3, "data": Nil }}
        "purses": ${JSON.stringify(payload.purses).replace(new RegExp(': null|:null', 'g'), ': Nil')},
        // example
        // "data": { "0": "this bag is mine" }
        "data": ${JSON.stringify(payload.data).replace(new RegExp(': null|:null', 'g'), ': Nil')},
      },
      *returnCh
    )) |
    for (@r <- returnCh) {
      match r {
        String => {
          basket!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        _ => {
          stdout!("completed, purses created and saved to box") |
          basket!({ "status": "completed" })
        }
      }
    }
  }
}
`;
};
