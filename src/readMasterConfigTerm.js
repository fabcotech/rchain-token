/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.readMasterConfigTerm = (
  payload
) => {
  return `new return, entryCh, lookup(\`rho:registry:lookup\`), stdout(\`rho:io:stdout\`) in {
  lookup!(\`rho:id:${payload.masterRegistryUri}\`, *entryCh) |
  for (entry <- entryCh) {
    entry!(("PUBLIC_READ_MASTER_CONFIG", *return))
  }
}
`;
};
