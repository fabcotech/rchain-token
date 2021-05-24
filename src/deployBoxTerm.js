/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.deployBoxTerm = (
  payload
) => {
  return `new basket,
  masterEntryCh,
  registerBoxReturnCh,
  sendReturnCh,
  deletePurseReturnCh,
  boxCh,
  stdout(\`rho:io:stdout\`),
  deployerId(\`rho:rchain:deployerId\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  registryLookup!(\`rho:id:${payload.masterRegistryUri}\`, *masterEntryCh) |

  for (masterEntry <- masterEntryCh) {
    masterEntry!(("PUBLIC_REGISTER_BOX", { "boxId": "${payload.boxId}", "publicKey": "${payload.publicKey}" }, *registerBoxReturnCh)) |
    for (@r <- registerBoxReturnCh) {
      match r {
        String => {
          basket!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        (true, box) => {
          @(*deployerId, "rchain-token-box", "${payload.masterRegistryUri}", "${payload.boxId}")!(box) |
          basket!({ "status": "completed", "message": { "boxId": "${payload.boxId}" } }) |
          stdout!("completed, box registered")
        }
      }
    }
  }
}
`;
};
