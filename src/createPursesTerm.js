module.exports.createPursesTerm = (payload) => {
  const ids = Object.keys(payload.purses);
  ids.forEach((id) => {
    payload.purses[id].data = payload.data[id] || null;
  });

  return `new basket,
  returnCh,
  boxCh,
  itCh,
  idsCh,
  resultsCh,
  stdout(\`rho:io:stdout\`),
  deployerId(\`rho:rchain:deployerId\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  for (superKey <<- @(*deployerId, "rchain-token-contract", "${
    payload.masterRegistryUri
  }", "${payload.contractId}")) {

    for (@ids <- idsCh) {
      for (@i <= itCh) {
        match i {
          ${ids.length} => {
            for (@results <- resultsCh) {
              basket!(results)
            }
          }
          _ => {
            new x in {
              superKey!(("CREATE_PURSE", ${JSON.stringify(
                payload.purses
              ).replace(
                new RegExp(': null|:null', 'g'),
                ': Nil'
              )}.get(ids.nth(i)), *x)) |
              for (@y <- x) {
                for (@results <- resultsCh) {
                  resultsCh!(results.set(ids.nth(i), y)) |
                  itCh!(i + 1)
                }
              }
            }
          }
        }
      }
    } |
    idsCh!([${ids.map((id) => `"${id}"`).join(', ')}]) |
    itCh!(0) |
    resultsCh!({})
  }
}
`;
};
