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

  for (masterEntry <- masterEntryCh) {
    masterEntry!(("PUBLIC_REGISTER_CONTRACT", { "contractId": "${payload.contractId}", "boxId": "${payload.boxId}", "fungible": ${payload.fungible}, "fee": ${payload.fee ? `("${payload.fee[0]}", ${payload.fee[1]})` : "Nil"} }, *registerContractReturnCh)) |
    for (@r <- registerContractReturnCh) {
      match r {
        String => {
          basket!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        (true, superKey) => {
          stdout!(("superKey", superKey)) |
          @(*deployerId, "rchain-token-contract", "${payload.masterRegistryUri}", "${payload.contractId}")!(superKey) |
          basket!({ "status": "completed" }) |
          stdout!("completed, contract registered")
        }
      }
    }
  }
}
`;
};
