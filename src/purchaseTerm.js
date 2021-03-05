module.exports.purchaseTerm = (
  registryUri,
  payload
) => {
  return `
new
  basket,
  revVaultPurseCh,
  priceCh,
  quantityCh,
  publicKeyCh,
  returnCh,
  purseIdCh,
  registryUriCh,
  revAddressCh,
  registryLookup(\`rho:registry:lookup\`),
  stdout(\`rho:io:stdout\`),
  revAddress(\`rho:rev:address\`)
in {

  /*
    The 5 following values must be filled with proper values
  */
  // Registry URI of the contract
  registryUriCh!!(\`rho:id:${registryUri}\`) |
  // Unique ID of the token you want to purchase
  purseIdCh!!("${payload.purseId}") |
  // Per token price, make sure it is accurate
  priceCh!!(${payload.price || "Nil"}) |
  // Quantity you want to purchase, make sure enough are available
  quantityCh!!(${payload.quantity}) |
  // Your public key
  // If the transfer fails, refund will go to the corresponding REV address
  publicKeyCh!!("${payload.publicKey}") |

  registryLookup!(\`rho:rchain:revVault\`, *revVaultPurseCh) |

  /*
    Create a vault/purse that is just used once (purse)
  */
  for(@(_, *RevVaultPurse) <- revVaultPurseCh) {
    new unf, purseRevAddrCh, purseAuthKeyCh, vaultCh, revAddressCh in {
      revAddress!("fromUnforgeable", *unf, *purseRevAddrCh) |
      RevVaultPurse!("unforgeableAuthKey", *unf, *purseAuthKeyCh) |
      for (@purseAuthKey <- purseAuthKeyCh; @purseRevAddr <- purseRevAddrCh) {

        stdout!({"new purse rev addr": purseRevAddr, "purse authKey": purseAuthKey}) |

        RevVaultPurse!("findOrCreate", purseRevAddr, *vaultCh) |

        for (
          @(true, *vault) <- vaultCh;
          @publicKey <- publicKeyCh;
          @purseId <- purseIdCh;
          @registryUri <- registryUriCh;
          @price <- priceCh;
          @quantity <- quantityCh
        ) {

          revAddress!("fromPublicKey", publicKey.hexToBytes(), *revAddressCh) |

          new RevVaultCh in {

            registryLookup!(\`rho:rchain:revVault\`, *RevVaultCh) |
            for (@(_, RevVault) <- RevVaultCh; deployerRevAddress <- revAddressCh) {

              stdout!(("3.transfer_funds.rho")) |

              /*
                Put price * quantity REV in the purse
              */
              match (
                *deployerRevAddress,
                purseRevAddr,
                price * quantity
              ) {
                (from, to, amount) => {

                  new vaultCh, revVaultkeyCh, deployerId(\`rho:rchain:deployerId\`) in {
                    @RevVault!("findOrCreate", from, *vaultCh) |
                    @RevVault!("deployerAuthKey", *deployerId, *revVaultkeyCh) |
                    for (@(true, vault) <- vaultCh; key <- revVaultkeyCh) {

                      stdout!(("Beginning transfer of ", amount, "REV from", from, "to", to)) |

                      new resultCh, entryCh in {
                        @vault!("transfer", to, amount, *key, *resultCh) |
                        for (@result <- resultCh) {

                          stdout!(("Finished transfer of ", amount, "REV to", to, "result was:", result)) |
                          match result {
                            (true, Nil) => {
                              stdout!("yes") |
                              registryLookup!(registryUri, *entryCh) |

                              for(entry <- entryCh) {
                                @(*entryCh, "PUBLIC_PURCHASE")!((
                                  {
                                    "quantity": quantity,
                                    "purseId": purseId,
                                    "publicKey": publicKey,
                                    "purseRevAddr": purseRevAddr,
                                    "purseAuthKey": purseAuthKey
                                  },
                                  *returnCh
                                ))
                                for (resp <- returnCh) {
                                  match *resp {
                                    (true, purse) => {
                                      new readReturnCh in {
                                        @(*entryCh, "PUBLIC_READ")!((Nil, readReturnCh)) |
                                        for (current <- readReturnCh) {
                                          registryLookup!(\`rho:id:${payload.toBoxRegistryUri}\`, *boxEntryCh) |
                                          for (boxEntry <- boxEntryCh) {
                                            for (current <<- mainCh) {
                                              @(*boxEntry, "PUBLIC_RECEIVE_PURSE")!((
                                                {
                                                  "registryUri": *current.get("registryUri"),
                                                  "purse": purse,
                                                  "fungible": *current.get("fungible"),
                                                  "type": *properties.get("type")
                                                },
                                                *receivePursesReturnCh
                                              )) |
                                              for (r <- receivePursesReturnCh) {
                                                match *r {
                                                  String => {
                                                    basket!({ "status": "failed", "message": *resp }) |
                                                    stdout!(("failed", *resp))
                                                  }
                                                  _ => {
                                                    basket!({ "status": "completed" }) |
                                                    stdout!("purchase went well")
                                                  }
                                                }
                                              }
                                            }
                                          }

                                        }
                                      }
                                    }
                                    String => {
                                      basket!({ "status": "failed", "message": *resp }) |
                                      stdout!(("failed", *resp))
                                    }
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
    }
  }
}`;
};
