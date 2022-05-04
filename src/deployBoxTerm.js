/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.deployBoxTerm = (
  payload
) => {
  return `new basket,
  entryCh,
  registerBoxReturnCh,
  stdout(\`rho:io:stdout\`),
  deployerId(\`rho:rchain:deployerId\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  registryLookup!(\`rho:id:${payload.masterRegistryUri}\`, *entryCh) |

  for (entry <- entryCh) {
    entry!(("PUBLIC_REGISTER_BOX", { "boxId": "${payload.boxId}", "publicKey": "${payload.publicKey}", "revAddress": "${payload.revAddress}" }, *registerBoxReturnCh)) |
    for (@r <- registerBoxReturnCh) {
      stdout!(r) |
      match r {
        String => {
          basket!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        (true, p) => {
          @(*deployerId, "rchain-token-box", "${payload.masterRegistryUri}", p.get("boxId"))!(p.get("boxCh")) |
          // OP_PUBLIC_REGISTER_BOX_COMPLETED_BEGIN
          basket!({ "status": "completed", "boxId": p.get("boxId") }) |
          stdout!("completed, box registered")
          // OP_PUBLIC_REGISTER_BOX_COMPLETED_END
        }
      }
    }
  }
}
`;
};
