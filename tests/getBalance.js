const rc = require('rchain-toolkit');

module.exports.main = async (publicKey) => {
  const term = `new return, rl(\`rho:registry:lookup\`), RevVaultCh, vaultCh, balanceCh in {
    rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
    for (@(_, RevVault) <- RevVaultCh) {
      @RevVault!("findOrCreate", "${rc.utils.revAddressFromPublicKey(
        publicKey
      )}", *vaultCh) |
      for (@(true, vault) <- vaultCh) {
        @vault!("balance", *balanceCh) |
        for (@balance <- balanceCh) { return!(balance) }
      }
    }
  }`;

  const result = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: term,
  });

  return rc.utils.rhoValToJs(JSON.parse(result).expr[0]);
};
