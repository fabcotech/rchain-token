/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.creditTerm = (
  payload
) => {
  return `
new
  basket,
  revVaultCh,
  boxCh,

  returnCh,
  quantityCh,
  revAddressCh,

  contractExistsCh,
  proceed1Ch,
  proceed2Ch,
  registryLookup(\`rho:registry:lookup\`),
  deployerId(\`rho:rchain:deployerId\`),
  stdout(\`rho:io:stdout\`),
  revAddress(\`rho:rev:address\`)
in {

  quantityCh!(${payload.quantity}) |
  revAddressCh!("${payload.revAddress}") |

  for (boxCh <<- @(*deployerId, "rchain-token-box", "${payload.masterRegistryUri}", "${payload.boxId}")) {

    registryLookup!(\`rho:id:${payload.masterRegistryUri}\`, *contractExistsCh) |
    for (_ <- contractExistsCh) {
      proceed1Ch!(Nil)
    } |

    registryLookup!(\`rho:rchain:revVault\`, *revVaultCh) |

    /*
      Create a vault/purse that is just used once (purse)
    */
    for(@(_, *RevVault) <- revVaultCh; _ <- proceed1Ch; @quantity <- quantityCh) {
      new unf, purseRevAddrCh, purseAuthKeyCh, purseVaultCh, deployerRevAddressCh, RevVaultCh, deployerVaultCh, deployerAuthKeyCh in {
        revAddress!("fromUnforgeable", *unf, *purseRevAddrCh) |
        RevVault!("unforgeableAuthKey", *unf, *purseAuthKeyCh) |
        for (@purseAuthKey <- purseAuthKeyCh; @purseRevAddr <- purseRevAddrCh) {

          RevVault!("findOrCreate", purseRevAddr, *purseVaultCh) |

          for (@(true, purseVault) <- purseVaultCh) {
            registryLookup!(\`rho:rchain:revVault\`, *RevVaultCh) |
            for (@(_, RevVault) <- RevVaultCh; @deployerRevAddress <- revAddressCh) {
              
              // send price * quantity dust in purse
              @RevVault!("findOrCreate", deployerRevAddress, *deployerVaultCh) |
              @RevVault!("deployerAuthKey", *deployerId, *deployerAuthKeyCh) |
              for (@(true, deployerVault) <- deployerVaultCh; @deployerAuthKey <- deployerAuthKeyCh) {

                stdout!(("Beginning transfer of ", quantity, "dust from", deployerRevAddress, "to", purseRevAddr)) |

                new resultCh, entryCh in {
                  @deployerVault!("transfer", purseRevAddr, quantity, deployerAuthKey, *resultCh) |
                  for (@result <- resultCh) {

                    stdout!(("Finished transfer of ", quantity, "dust to", purseRevAddr, "result was:", result)) |
                    match result {
                      (true, Nil) => {
                        boxCh!((
                          "CREDIT",
                          {
                            "purseRevAddr": purseRevAddr,
                            "purseAuthKey": purseAuthKey
                          },
                          *returnCh
                        )) |
                        for (@r <- returnCh) {
                          stdout!(r) |
                          match r {
                            String => {
                              new refundPurseBalanceCh, refundResultCh in {
                                @purseVault!("balance", *refundPurseBalanceCh) |
                                for (@balance <- refundPurseBalanceCh) {
                                  if (balance != quantity) {
                                    stdout!("error: CRITICAL, purchase was not successful and balance of purse is now different from price * quantity")
                                  } |
                                  @purseVault!("transfer", deployerRevAddress, balance, purseAuthKey, *refundResultCh) |
                                  for (@result <- refundResultCh)  {
                                    match result {
                                      (true, Nil) => {
                                        match "error: purchase failed but was able to refund \${balance} " %% { "balance": balance } ++ r {
                                          s => {
                                            basket!({ "status": "failed", "message": s }) |
                                            stdout!(s)
                                          }
                                        }
                                      }
                                      _ => {
                                        stdout!(result) |
                                        match "error: CRITICAL purchase failed and was NOT ABLE to refund \${balance} " %% { "balance": balance } ++ r {
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
                              // OP_CREDIT_COMPLETED_BEGIN
                              basket!({ "status": "completed" }) |
                              stdout!("completed, credit successful")
                              // OP_CREDIT_COMPLETED_END
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
}`;
};
