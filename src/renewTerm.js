/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.renewTerm = (
  payload
) => {
  return `
new
  basket,
  revVaultCh,
  boxCh,

  returnCh,
  priceCh,
  publicKeyCh,
  purseIdCh,
  contractIdCh,

  revAddressCh,
  contractExistsCh,
  proceed1Ch,
  proceed2Ch,
  registryLookup(\`rho:registry:lookup\`),
  deployerId(\`rho:rchain:deployerId\`),
  stdout(\`rho:io:stdout\`),
  revAddress(\`rho:rev:address\`)
in {

  purseIdCh!!("${payload.purseId}") |
  publicKeyCh!!("${payload.publicKey}") |
  contractIdCh!!("${payload.contractId}") |
  priceCh!!(${payload.price || "Nil"}) |

  for (boxCh <<- @(*deployerId, "rchain-token-box", "${payload.masterRegistryUri}", "${payload.boxId}")) {

    registryLookup!(\`rho:id:${payload.masterRegistryUri}\`, *contractExistsCh) |
    for (_ <- contractExistsCh) {
      proceed1Ch!(Nil)
    } |

    registryLookup!(\`rho:rchain:revVault\`, *revVaultCh) |

    /*
      Create a vault/purse that is just used once (purse)
    */
    for(@(_, *RevVault) <- revVaultCh; _ <- proceed1Ch) {
      new unf, purseRevAddrCh, purseAuthKeyCh, purseVaultCh, deployerRevAddressCh, RevVaultCh, deployerVaultCh, deployerAuthKeyCh in {
        revAddress!("fromUnforgeable", *unf, *purseRevAddrCh) |
        RevVault!("unforgeableAuthKey", *unf, *purseAuthKeyCh) |
        for (@purseAuthKey <- purseAuthKeyCh; @purseRevAddr <- purseRevAddrCh) {

          RevVault!("findOrCreate", purseRevAddr, *purseVaultCh) |

          for (
            @(true, purseVault) <- purseVaultCh;
            @purseId <- purseIdCh;
            @contractId <- contractIdCh;
            @price <- priceCh;
            @publicKey <- publicKeyCh
          ) {

            stdout!({
              "price": price,
              "purseId": purseId,
              "contractId": contractId,
              "publicKey": publicKey
            }) |
            match {
              "price": price,
              "purseId": purseId,
              "contractId": contractId,
              "publicKey": publicKey
            } {
              {
                "price": Int,
                "purseId": String,
                "contractId": String,
                "publicKey": String
              } => {
                proceed2Ch!(Nil)
              }
              _ => {
                basket!({ "status": "failed", "message": "error: invalid payload, cancelled renew and payment" }) |
                stdout!(("failed", "error: invalid payload, cancelled renew and payment"))
              }
            } |

            for (_ <- proceed2Ch) {

              revAddress!("fromPublicKey", publicKey.hexToBytes(), *deployerRevAddressCh) |
              registryLookup!(\`rho:rchain:revVault\`, *RevVaultCh) |
              for (@(_, RevVault) <- RevVaultCh; @deployerRevAddress <- deployerRevAddressCh) {
                
                // send price dust in purse
                @RevVault!("findOrCreate", deployerRevAddress, *deployerVaultCh) |
                @RevVault!("deployerAuthKey", *deployerId, *deployerAuthKeyCh) |
                for (@(true, deployerVault) <- deployerVaultCh; @deployerAuthKey <- deployerAuthKeyCh) {

                  stdout!(("Beginning transfer of ", price, "dust from", deployerRevAddress, "to", purseRevAddr)) |

                  new resultCh, entryCh in {
                    @deployerVault!("transfer", purseRevAddr, price, deployerAuthKey, *resultCh) |
                    for (@result <- resultCh) {

                      stdout!(("Finished transfer of ", price, "dust to", purseRevAddr, "result was:", result)) |
                      match result {
                        (true, Nil) => {
                          boxCh!((
                            "RENEW",
                            {
                              "contractId": contractId,
                              "purseId": purseId,
                              "purseRevAddr": purseRevAddr,
                              "purseAuthKey": purseAuthKey
                            },
                            *returnCh
                          )) |
                          for (@r <- returnCh) {
                            match r {
                              String => {
                                new refundPurseBalanceCh, refundResultCh in {
                                  @purseVault!("balance", *refundPurseBalanceCh) |
                                  for (@balance <- refundPurseBalanceCh) {
                                    if (balance != price) {
                                      stdout!("error: CRITICAL, renew was not successful and balance of purse is now different from price")
                                    } |
                                    @purseVault!("transfer", deployerRevAddress, balance, purseAuthKey, *refundResultCh) |
                                    for (@result <- refundResultCh)  {
                                      match result {
                                        (true, Nil) => {
                                          match "error: renew failed but was able to refund \${balance} " %% { "balance": balance } ++ r {
                                            s => {
                                              basket!({ "status": "failed", "message": s }) |
                                              stdout!(s)
                                            }
                                          }
                                        }
                                        _ => {
                                          stdout!(result) |
                                          match "error: CRITICAL renew failed and was NOT ABLE to refund \${balance} " %% { "balance": balance } ++ r {
                                            s => {
                                              basket!({ "status": "failed", "message": s }) |
                                              stdout!(s)
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                              _ => {
                                // OP_RENEW_COMPLETED_BEGIN
                                basket!({ "status": "completed" }) |
                                stdout!("completed, renew successful")
                                // OP_RENEW_COMPLETED_END
                              }
                            }
                          }
                        }
                        _ => {
                          basket!({ "status": "failed", "message": result }) |
                          stdout!(("failed", result))
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;
};
