
module.exports.readBoxTerm = (
  boxRegistryUri
) => {
  return `new return, entryCh, lookup(\`rho:registry:lookup\`), stdout(\`rho:io:stdout\`) in {
  lookup!(\`rho:id:${boxRegistryUri}\`, *entryCh) |
  for(entry <- entryCh) {
    stdout!(*entry) |
    new a in {
      @(*entry, "PUBLIC_READ")!((Nil, *a)) |
      for (current <- a) {
        new b in {
          @(*entry, "PUBLIC_READ_SUPER_KEYS")!((Nil, *b)) |
          for (superKeys <- b) {
            new c in {
              @(*entry, "PUBLIC_READ_PURSES")!((Nil, *c)) |
              for (purses <- c) {
                return!(
                  *current
                    .set("superKeys", *superKeys)
                    .set("purses", *purses)
                )
              }
            }
          }
        }
      }
    }
  }
}`;
};
