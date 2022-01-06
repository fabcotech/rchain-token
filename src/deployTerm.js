/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.deployTerm = (payload) => {
    return `new basket,
  masterEntryCh,
  registerContractReturnCh,
  boxCh,
  stdout(\`rho:io:stdout\`),
  deployerId(\`rho:rchain:deployerId\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  registryLookup!(\`rho:id:${payload.masterRegistryUri}\`, *masterEntryCh) |

  for (boxCh <<- @(*deployerId, "rchain-token-box", "${payload.masterRegistryUri}", "${payload.boxId}")) {
    boxCh!(("REGISTER_CONTRACT", { "contractId": "${payload.contractId}", "fungible": ${payload.fungible}, "expires": ${payload.expires ? payload.expires : "Nil"} }, *registerContractReturnCh)) |
    for (@r <- registerContractReturnCh) {
      match r {
        String => {
          basket!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        (true, p) => {
          @(*deployerId, "rchain-token-contract", "${payload.masterRegistryUri}", p.get("contractId"))!(p.get("superKey")) |
          // OP_REGISTER_CONTRACT_COMPLETED_BEGIN
          basket!({
            "status": "completed",
            "masterRegistryUri": "${payload.masterRegistryUri}",
            "contractId": p.get("contractId"),
          }) |
          stdout!("completed, contract registered")
          // OP_REGISTER_CONTRACT_COMPLETED_END
        }
      }
    }
  }
}
`;
};
