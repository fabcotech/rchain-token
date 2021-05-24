/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.deployTerm = (payload) => {
    return `new basket,
  masterEntryCh,
  registerContractReturnCh,
  sendReturnCh,
  deletePurseReturnCh,
  boxCh,
  stdout(\`rho:io:stdout\`),
  deployerId(\`rho:rchain:deployerId\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  registryLookup!(\`rho:id:${payload.masterRegistryUri}\`, *masterEntryCh) |

  for (boxCh <<- @(*deployerId, "rchain-token-box", "${payload.masterRegistryUri}", "${payload.boxId}")) {
    boxCh!(("PUBLIC_REGISTER_CONTRACT", { "contractId": "${payload.contractId}", "fungible": ${payload.fungible}, "fee": ${payload.fee ? `("${payload.fee[0]}", ${payload.fee[1]})` : "Nil"} }, *registerContractReturnCh)) |
    for (@r <- registerContractReturnCh) {
      match r {
        String => {
          basket!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        (true, superKey) => {
          @(*deployerId, "rchain-token-contract", "${payload.masterRegistryUri}", "${payload.contractId}")!(superKey) |
          basket!({ "status": "completed", "message": {
            "masterRegistryUri": "${payload.masterRegistryUri}",
            "contractId": "${payload.contractId}",
          } }) |
          stdout!("completed, contract registered")
        }
      }
    }
  }
}
`;
};
