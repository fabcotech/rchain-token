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
  newIdCh,
  dataCh,
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
  // New ID only used if fungible = false
  newIdCh!!("${payload.newId ? payload.newId : "Nil"}") |
  // Per token price, make sure it is accurate
  priceCh!!(${payload.price || "Nil"}) |
  // Quantity you want to purchase, make sure enough are available
  quantityCh!!(${payload.quantity}) |
  // Your public key
  // If the transfer fails, refund will go to the corresponding REV address
  publicKeyCh!!("${payload.publicKey}") |
  // data
  dataCh!("${payload.data}") |

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
          @quantity <- quantityCh;
          @newId <- newIdCh;
          @data <- dataCh
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
                                stdout!("PUBLIC_PURCHASE") |
                                stdout!(*entry) |
                                @(*entry, "PUBLIC_PURCHASE")!((
                                  {
                                    "quantity": quantity,
                                    "purseId": purseId,
                                    "newId": newId,
                                    "data": data,
                                    "publicKey": publicKey,
                                    "purseRevAddr": purseRevAddr,
                                    "purseAuthKey": purseAuthKey
                                  },
                                  *returnCh
                                )) |
                                for (resp <- returnCh) {
                                  stdout!(*resp) |
                                  match *resp {
                                    (true, purse) => {
                                      stdout!("yep") |
                                      new readReturnCh, boxEntryCh, receivePursesReturnCh in {
                                        @(*entry, "PUBLIC_READ")!((Nil, *readReturnCh)) |
                                        for (@current <- readReturnCh) {
                                          stdout!(("current", current)) |
                                          registryLookup!(\`rho:id:${payload.toBoxRegistryUri}\`, *boxEntryCh) |
                                          for (boxEntry <- boxEntryCh) {
                                            @(*boxEntry, "PUBLIC_RECEIVE_PURSE")!((
                                              {
                                                "registryUri": current.get("registryUri"),
                                                "purse": purse,
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
                                    _ => {
                                      stdout!(*resp) |
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
