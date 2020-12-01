module.exports.mainTerm = (newNonce, publicKey) => {
    return `new 
  mainCh,
  createCh,
  purchaseCh,
  sendCh,
  entryCh,
  entryUriCh,
  setLockedCh,
  updateTokenDataCh,
  updateBagDataCh,
  updateUriCh,
  bags,
  bagsData,
  tokensData,
  verifySignatureAndUpdateNonceCh,
  justVerifySignatureCh,
  insertArbitrary(\`rho:registry:insertArbitrary\`),
  stdout(\`rho:io:stdout\`),
  secpVerify(\`rho:crypto:secp256k1Verify\`),
  blake2b256(\`rho:crypto:blake2b256Hash\`),
  revAddress(\`rho:rev:address\`),
  registryLookup(\`rho:registry:lookup\`)
in {


  /*
    bags: {
      [bagId: String (incremental id)]: {
        publicKey: String (public key),
        n: Nil \\/ String (token id),
        price: Nil \\/ Int
        quantity: Int
      }
    }
  */
  bags!({/*DEFAULT_BAGS*/}) |

  /*
    bagsData: {
      [bagId: String (bag id)]: Any
    }
  */
  bagsData!({/*DEFAULT_BAGS_DATA*/}) |

  /*
    tokensData: {
      [n: Strig (token id)]: String (registry URI)
    }
  */
  tokensData!({/*DEFAULT_TOKENS_DATA*/}) |

  for (@(payload, signature, returnCh) <= verifySignatureAndUpdateNonceCh) {
    new hashCh, verifySignatureCh in {
      for (@current <<- mainCh) {
        blake2b256!(
          payload.set("nonce", current.get("nonce")).toByteArray(),
          *hashCh
        ) |
        for (@hash <- hashCh) {
          secpVerify!(
            hash,
            signature.hexToBytes(),
            current.get("publicKey").hexToBytes(),
            *verifySignatureCh
          )
        } |
        for (@result <- verifySignatureCh) {
          match result {
            true => {
              @returnCh!(true) |
              for (@c <- mainCh) {
                mainCh!(c.set("nonce", payload.get("newNonce")))
              }
            }
            false => {
              @returnCh!("error: Invalid signature, could not perform operation")
            }
          }
        }
      }
    }
  } |

  for (@(publicKey, signature, payload, nonce, returnCh) <= justVerifySignatureCh) {
    stdout!("justVerifySignatureCh") |
    new hashCh, verifySignatureCh in {
      blake2b256!(
        payload.set("nonce", nonce).toByteArray(),
        *hashCh
      ) |
      for (@hash <- hashCh) {
        secpVerify!(
          hash,
          signature.hexToBytes(),
          publicKey.hexToBytes(),
          *verifySignatureCh
        )
      } |
      for (@result <- verifySignatureCh) {
        @returnCh!(result)
      }
    }
  } |

  contract setLockedCh(payload, signature, return) = {
    stdout!("setLockedCh") |

    for (@current <<- mainCh) {
      match current.get("locked") {
        true => {
          return!("error: contract is already locked")
        }
        false => {
          new verifyCh in {
            verifySignatureAndUpdateNonceCh!((
              *payload,
              *signature,
              *verifyCh
            )) |
            for (@verified <- verifyCh) {
              match verified {
                true => {
                  for (@c <- mainCh) {
                    mainCh!(c.set("locked", true))
                  } |
                  return!(true)
                }
                err => {
                  return!(err)
                }
              }
            }
          }
        }
      }
    }
  } |

  contract updateTokenDataCh(payload, signature, return) = {
    stdout!("updateTokenDataCh") |

    for (@current <<- mainCh) {
      match current.get("locked") {
        true => {
          return!("error: contract is locked, cannot update token data")
        }
        false => {
          new verifyCh in {
            verifySignatureAndUpdateNonceCh!((
              *payload,
              *signature,
              *verifyCh
            )) |
            for (@verified <- verifyCh) {
              match verified {
                true => {
                  for (@currentTokensData <- tokensData) {
                    tokensData!(
                      currentTokensData.set(*payload.get("n"), *payload.get("data"))
                    )
                  } |
                  return!(true)
                }
                err => {
                  return!(err)
                }
              }
            }
          }
        }
      }
    }
  } |

  contract updateBagDataCh(payload, signature, return) = {
    stdout!("updateBagDataCh") |
    for (@currentBags <<- bags) {
      match currentBags.get(*payload.get("bagId")) {
        Nil => {
          return!("error : token (bag ID) " ++ *payload.get("bagId") ++ " does not exist")
        }
        bag => {
          new justVerifySignatureReturnCh in {
            justVerifySignatureCh!((
              bag.get("publicKey"),
              *signature,
              *payload,
              bag.get("nonce"),
              *justVerifySignatureReturnCh
            )) |
            for (@verified <- justVerifySignatureReturnCh) {
              match verified {
                true => {
                  for (@currentBagsData <- bagsData) {
                    bagsData!(
                      currentBagsData.set(*payload.get("bagId"), *payload.get("data"))
                    ) |
                    return!(true)
                  }
                }
                err => {
                  return!("error: Invalid signature, could not perform operation")
                }
              }
            }
          }
        }
      }
    }
  } |

  // add a token (1 or more)
  contract createCh(payload, signature, return) = {
    stdout!("createCh") |

    for (@current <<- mainCh) {
      match current.get("locked") {
        true => {
          return!("error: contract is locked, cannot create token")
        }
        false => {
          for (@currentBags <<- bags) {
            new verifyCh in {
              verifySignatureAndUpdateNonceCh!((
                *payload,
                *signature,
                *verifyCh
              )) |
              for (@verified <- verifyCh) {
                match verified {
                  true => {
                    new newBagIdCh in {
                      match currentBags.get(*payload.get("newBagId")) {
                        Nil => { newBagIdCh!(*payload.get("newBagId")) }
                        _ => { return!("error: bagId, already exists") }
                      } |

                      for (@newBagId <- newBagIdCh) {
                        for (_ <- bags) {
                          bags!(
                            currentBags.set(newBagId, {
                              "quantity": *payload.get("quantity"),
                              "publicKey": *payload.get("publicKey"),
                              "nonce": *payload.get("bagNonce"),
                              "n": *payload.get("n"),
                              "price": *payload.get("price"),
                            })
                          )
                        } |

                        match *payload.get("data") {
                          Nil => {}
                          data => {
                            for (@currentBagsData <- bagsData) {
                              bagsData!(
                                currentBagsData.set(newBagId, data)
                              )
                            }
                          }
                        } |

                        return!(true)
                      }
                    }
                  }
                  err => {
                    return!(err)
                  }
                }
              }
            }
          }
        }
      }
    }
  } |

  // purchase token (1 or more)
  contract purchaseCh(payload, return) = {
    stdout!("purchaseCh") |
    for (@currentBags <<- bags) {
      match currentBags.get(*payload.get("bagId")) {
        Nil => {
          return!("error : token (bag ID) " ++ *payload.get("bagId") ++ " does not exist")
        }
        bag => {
          match bag.get("quantity") - *payload.get("quantity") >= 0 {
            false => {
              return!("error : not enough tokens in bag (bag ID: " ++ *payload.get("bagId") ++ ") available")
            }
            true => {
              new RevVaultCh, ownerRevAddressCh in {

                registryLookup!(\`rho:rchain:revVault\`, *RevVaultCh) |
                revAddress!("fromPublicKey", bag.get("publicKey").hexToBytes(), *ownerRevAddressCh) |

                for (@(_, RevVault) <- RevVaultCh; @ownerRevAddress <- ownerRevAddressCh) {
                  match (
                    *payload.get("purseRevAddr"),
                    ownerRevAddress,
                    *payload.get("quantity") * bag.get("price")
                  ) {
                    (from, to, amount) => {
                      new purseVaultCh in {
                        @RevVault!("findOrCreate", from, *purseVaultCh) |
                        for (@(true, purseVault) <- purseVaultCh) {

                          new resultCh, newBagIdCh in {
                            @purseVault!("transfer", to, amount, *payload.get("purseAuthKey"), *resultCh) |
                            for (@result <- resultCh) {
                              match result {
                                (true, Nil) => {
                                  match currentBags.get(*payload.get("newBagId")) {
                                    Nil => { newBagIdCh!(*payload.get("newBagId")) }
                                    _ => { return!("error: bagId, already exists") }
                                  } |
                                  for (@newBagId <- newBagIdCh) {
                                    match *payload.get("data") {
                                      Nil => {}
                                      data => {
                                        for (@currentBagsData <- bagsData) {
                                          bagsData!(currentBagsData.set(newBagId, data))
                                        }
                                      }
                                    } |
                                    for (_ <- bags) {
                                      match bag.get("quantity") - *payload.get("quantity") == 0 {
                                        true => {
                                          // todo, should we delete bag data for *payload.get("bagId") here ?
                                          bags!(
                                            currentBags.set(newBagId, {
                                              "quantity": *payload.get("quantity"),
                                              "publicKey": *payload.get("publicKey"),
                                              "nonce": *payload.get("nonce"),
                                              "n": bag.get("n"),
                                              "price": Nil,
                                            })
                                            // Delete seller bag
                                            .delete(*payload.get("bagId"))
                                          )
                                        }
                                        false => {
                                          bags!(
                                            currentBags.set(newBagId, {
                                              "quantity": *payload.get("quantity"),
                                              "publicKey": *payload.get("publicKey"),
                                              "nonce": *payload.get("nonce"),
                                              "n": bag.get("n"),
                                              "price": Nil,
                                            // Udate quantity in seller token ownership
                                            }).set(
                                              *payload.get("bagId"),
                                              bag.set("quantity", bag.get("quantity") - *payload.get("quantity"))
                                            )
                                          )
                                        }
                                      } |
                                      return!(true)
                                    }
                                  }
                                }
                                _ => {
                                  stdout!("transfer error, initiate refund") |
                                  stdout!(result) |
                                  new refundPurseBalanceCh, refundRevAddressCh, refundResultCh in {
                                    @purseVault!("balance", *refundPurseBalanceCh) |
                                    revAddress!("fromPublicKey", *payload.get("publicKey").hexToBytes(), *refundRevAddressCh) |
                                    for (@balance <- refundPurseBalanceCh; @revAddress <- refundRevAddressCh) {
                                      @purseVault!("transfer", revAddress, balance, *payload.get("purseAuthKey"), *refundResultCh) |
                                      for (@refundResult <- refundResultCh) {
                                        match refundResult {
                                          (true, Nil) => {
                                            stdout!("refund went well") |
                                            return!("error : REV transfer went wrong, issuer was refunded")
                                          }
                                          _ => {
                                            stdout!("error: refund DID NOT go well") |
                                            return!("error : REV transfer went wrong, issuer was NOT refunded")
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
              }
            }
          }
        }
      }
    }
  } |

  contract sendCh(payload, signature, return) = {
    stdout!("sendCh") |
    for (@currentBags <<- bags) {
      match currentBags.get(*payload.get("bagId")) {
        Nil => {
          return!("error : token (bag ID) " ++ *payload.get("bagId") ++ " does not exist")
        }
        bag => {
          match bag.get("quantity") - *payload.get("quantity") >= 0 {
            true => {
              new justVerifySignatureReturnCh in {
                justVerifySignatureCh!((
                  bag.get("publicKey"),
                  *signature,
                  *payload,
                  bag.get("nonce"),
                  *justVerifySignatureReturnCh
                )) |
                for (@r <- justVerifySignatureReturnCh) {
                  match r {
                    true => {
                      match "\${bagId}" %% { "bagId": currentBags.size() } {
                        bagId => {
                          // Add bag data if found in payload
                          match *payload.get("data") {
                            Nil => {}
                            data => {
                              for (@currentBagsData <- bagsData) {
                                bagsData!(currentBagsData.set(bagId, data))
                              }
                            }
                          } |
                          for (_ <- bags) {
                            match bag.get("quantity") - *payload.get("quantity") == 0 {
                              true => {
                                bags!(
                                  // todo, should we delete bag data for *payload.get("bagId") here ?
                                  currentBags.set(bagId, {
                                    "quantity": *payload.get("quantity"),
                                    "publicKey": *payload.get("publicKey"),
                                    "nonce": *payload.get("bagNonce2"),
                                    "n": bag.get("n"),
                                    "price": Nil,
                                  // Delete issuer bag
                                  }).delete(*payload.get("bagId"))
                                )
                              }
                              false => {
                                bags!(
                                  // New bag ID for new bag
                                  currentBags.set(bagId, {
                                    "quantity": *payload.get("quantity"),
                                    "publicKey": *payload.get("publicKey"),
                                    "nonce": *payload.get("bagNonce2"),
                                    "n": bag.get("n"),
                                    "price": Nil,
                                  // Udate quantity in seller bag
                                  }).set(
                                    *payload.get("bagId"),
                                    bag.set(
                                      "quantity", bag.get("quantity") - *payload.get("quantity")
                                    ).set(
                                      "nonce",
                                      *payload.get("bagNonce")
                                    )
                                  )
                                )
                              }
                            } |
                            return!(true)
                          }
                        }
                      }
                    }
                    false => {
                      return!("error: Invalid signature, could not perform operation")
                    }
                  }
                }
              }
            }
            false => {
              return!("error : not enough tokens in bag (bag ID) " ++ *payload.get("bagId") ++ " available")
            }
          }
        }
      }
    }
  } |
  
  contract entryCh(action, return) = {
    match *action.get("type") {
      // Read capabilities
      "READ_BAGS" => {
        for (currentBags <<- bags) {
          return!(*currentBags)
        }
      }
      "READ_BAGS_DATA" => {
        for (currentBagsData <<- bagsData) {
          return!(*currentBagsData)
        }
      }
      "READ_TOKENS_DATA" => {
        for (@currentTokensData <<- tokensData) {
          return!(currentTokensData)
        }
      }
      "READ" => {
        for (current <<- mainCh) {
          return!(*current)
        }
      }
      // Admin capabilities (require a signature of the nonce)
      "SET_LOCKED" => {
        match *action.get("payload") {
          { "newNonce": String } => {
            setLockedCh!(
              *action.get("payload"),
              *action.get("signature"),
              *return
            )
          }
          _ => {
            return!("error: invalid payload, structure should be { 'newNonce': String, 'locked': Boolean }")
          }
        }
      }
      "UPDATE_TOKEN_DATA" => {
        match *action.get("payload") {
          { "newNonce": String, "n": String, "data": _ } => {
            updateTokenDataCh!(*action.get("payload"), *action.get("signature"), *return)
          }
          _ => {
            return!("error: invalid payload, structure should be { 'newNonce': String, 'n': String, 'data': _ }")
          }
        }
      }
      "UPDATE_BAG_DATA" => {
        match *action.get("payload") {
          { "newNonce": String, "bagId": String, "data": _ } => {
            updateBagDataCh!(
              *action.get("payload"),
              *action.get("signature"),
              *return
            )
          }
          _ => {
            return!("error: invalid payload, structure should be { 'newNonce': String, 'bagId': String, 'data': _ }")
          }
        }
      }
      "CREATE_TOKENS" => {
        match *action.get("payload") {
          {
            "newNonce": String,
            "bagNonce": String,
            "quantity": Int,
            "publicKey": String,
            "newBagId": String,
            "price": Nil \\/ Int,
            "n": String,
            "data": _
          } => {
            createCh!(
              *action.get("payload"),
              *action.get("signature"),
              *return
            )
          }
          _ => {
            return!("error: invalid payload, structure should be { 'newNonce': String, 'newBagId': String, 'bagNonce': String, 'quantity': Int, 'n': String, 'price': Nil or Int, 'publicKey': String, 'data': Any }")
          }
        }
      }
      // Anyone capabilities
      "PURCHASE_TOKENS" => {
        match *action.get("payload") {
          { "quantity": 1, "bagId": String, "newBagId": String, "publicKey": String, "nonce": String, "data": _, "purseRevAddr": _, "purseAuthKey": _ } => {
            purchaseCh!(*action.get("payload"), *return)
          }
          _ => {
            return!("error: invalid payload, structure should be { 'quantity': 1, 'bagId': String, 'newBagId': String, 'publicKey': String, 'nonce': String, 'data': Any, 'purseRevAddr': String, 'purseAuthKey': AuthKey }")
          }
        }
      }
      "SEND_TOKENS" => {
        return!("error: SEND_TOKENS is blocked")
        /*
        match *action.get("payload") {
          { "quantity": Int, "bagId": String, "publicKey": String, "bagNonce": String, "bagNonce2": String, "data": _, } => {
            sendCh!(
              *action.get("payload"),
              *action.get("signature"),
              *return
            )
          }
          _ => {
            return!("error: invalid payload, structure should be { 'quantity': Int, 'bagId': String, 'publicKey': String, 'bagNonce': String, 'bagNonce2': String, 'data': Any }")
          }
        }
        */
      }
      _ => {
        return!("error: unknown action")
      }
    }
  } |

  insertArbitrary!(bundle+{*entryCh}, *entryUriCh) |

  for (entryUri <- entryUriCh) {

    mainCh!({
      "registryUri": *entryUri,
      "locked": false,
      "publicKey": "${publicKey}",
      "nonce": "${newNonce}",
      "version": "4.0.0"
    }) |
    stdout!({
      "registryUri": *entryUri,
      "locked": false,
      "publicKey": "${publicKey}",
      "nonce": "${newNonce}",
      "version": "4.0.0"
    })

    /*OUTPUT_CHANNEL*/
  }
}
`;
};
