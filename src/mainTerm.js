module.exports.mainTerm = (newNonce, publicKey) => {
    return `new 
  mainCh,

  createCh,
  purchaseCh,
  sendCh,
  changePriceCh,
  entryCh,
  entryUriCh,
  setLockedCh,
  updateTokenDataCh,
  updateBagDataCh,
  verifySignatureAndUpdateNonceCh,
  justVerifySignatureCh,
  iterateCh,

  bags,
  bagsIds,
  bagsData,
  tokensData,
  counterCh,

  insertArbitrary(\`rho:registry:insertArbitrary\`),
  stdout(\`rho:io:stdout\`),
  secpVerify(\`rho:crypto:secp256k1Verify\`),
  blake2b256(\`rho:crypto:blake2b256Hash\`),
  revAddress(\`rho:rev:address\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  counterCh!(0) |

  /*
    BAGS
    bags are stored in a tuple-based channel, example bag 12:
    @(*bags, 12)!({ "publicKey": "aaa", etc... })

    bagsIds is a Set with all bags that contain at least one token
  */
  bagsIds!(Set()) |

  /*
    BAGS DATA
    bags data are stored in a tuple-based channel, example bag 12:
    @(*bagsData, 12)!("red")
  */

  /*
    TOKENS DATA
    tokens data are stored in a tuple-based channel, example token data 0:
    @(*tokensData, 0)!("gold tokens")
  */


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
                  // if already exists
                  for (_ <- @(*tokensData, *payload.get("n"))) {
                    @(*tokensData, *payload.get("n"))!(*payload.get("data"))
                  } |
                  // if not exists yet
                  @(*tokensData, *payload.get("n"))!(*payload.get("data")) |
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
    for (@ids <<- bagsIds) {
      match ids.contains(*payload.get("bagId")) {
        false => {
          return!("error : token (bag ID) " ++ *payload.get("bagId") ++ " does not exist")
        }
        true => {
          for (@bag <<- @(*bags, *payload.get("bagId"))) {
            stdout!("updateBagDataCh 2") |
            new justVerifySignatureReturnCh in {
              justVerifySignatureCh!((
                bag.get("publicKey"),
                *signature,
                *payload,
                bag.get("nonce"),
                *justVerifySignatureReturnCh
              )) |
              for (@verified <- justVerifySignatureReturnCh) {
                stdout!(("updateBagDataCh 3", verified)) |
                stdout!(("updateBagDataCh 4", *payload.get("bagId"), *payload.get("data"))) |
                match verified {
                  true => {
                    stdout!("verified") |
                    // if already exists
                    for (_ <- @(*bagsData, *payload.get("bagId"))) {
                      @(*bagsData, *payload.get("bagId"))!(*payload.get("data"))
                    } |
                    // if not exists yet
                    @(*bagsData, *payload.get("bagId"))!(*payload.get("data")) |
                    return!(true)
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
          new verifyCh, iterateCh2 in {
            verifySignatureAndUpdateNonceCh!((
              *payload,
              *signature,
              *verifyCh
            )) |
            for (@verified <- verifyCh) {
              match verified {
                true => {
                  iterateCh2!((*payload.get("bags").keys(), *payload.get("bags"), *payload.get("data"))) |
                  for(@(set, newBags, newData) <= iterateCh2) {
                    match set {
                      Nil => {}
                      Set(last) => {
                        return!(true) |
                        for (counter <- counterCh) {
                          counterCh!(*counter + 1) |
                          for (ids <- bagsIds) {
                            bagsIds!(*ids.union(Set("\${n}" %% { "n": *counter })))
                          } |
                          @(*bags, "\${n}" %% { "n": *counter })!(newBags.get(last)) |
                          @(*bagsData, "\${n}" %% { "n": *counter })!(newData.get(last))
                        }
                      }
                      Set(first ... rest) => {
                        for (counter <- counterCh) {
                          counterCh!(*counter + 1) |
                          iterateCh2!((rest, newBags, newData)) |
                          for (ids <- bagsIds) {
                            bagsIds!(*ids.union(Set("\${n}" %% { "n": *counter })))
                          } |
                          @(*bags, "\${n}" %% { "n": *counter })!(newBags.get(first)) |
                          @(*bagsData, "\${n}" %% { "n": *counter })!(newData.get(first))
                        }
                      }
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
  } |

  // purchase token (1 or more)
  contract purchaseCh(payload, return) = {
    stdout!("purchaseCh") |
    for (@ids <<- bagsIds) {
      match ids.contains(*payload.get("bagId")) {
        false => {
          return!("error : token (bag ID) " ++ *payload.get("bagId") ++ " does not exist")
        }
        true => {
          for (@bag <<- @(*bags, *payload.get("bagId"))) {
            match [bag.get("quantity") - *payload.get("quantity") >= 0, *payload.get("quantity") > 0] {
              [true, true] => {
                new RevVaultCh, ownerRevAddressCh, purseVaultCh in {

                  registryLookup!(\`rho:rchain:revVault\`, *RevVaultCh) |
                  revAddress!("fromPublicKey", bag.get("publicKey").hexToBytes(), *ownerRevAddressCh) |

                  for (@(_, RevVault) <- RevVaultCh; @ownerRevAddress <- ownerRevAddressCh) {
                    match (
                      *payload.get("purseRevAddr"),
                      ownerRevAddress,
                      *payload.get("quantity") * bag.get("price")
                    ) {
                      (from, to, amount) => {
                        @RevVault!("findOrCreate", from, *purseVaultCh) |
                        for (@(true, purseVault) <- purseVaultCh) {
                          new resultCh, performRefundCh in {                        
                            // refund
                            for (@message <- performRefundCh) {
                              new refundPurseBalanceCh, refundRevAddressCh, refundResultCh in {
                                @purseVault!("balance", *refundPurseBalanceCh) |
                                revAddress!("fromPublicKey", *payload.get("publicKey").hexToBytes(), *refundRevAddressCh) |
                                for (@balance <- refundPurseBalanceCh; @revAddress <- refundRevAddressCh) {
                                  @purseVault!("transfer", revAddress, balance, *payload.get("purseAuthKey"), *refundResultCh) |
                                  for (@refundResult <- refundResultCh) {
                                    match refundResult {
                                      (true, Nil) => {
                                        stdout!("refund went well") |
                                        return!(message ++ ", issuer was refunded")
                                      }
                                      _ => {
                                        stdout!("error: refund DID NOT go well") |
                                        return!(message ++ ", issuer was NOT refunded")
                                      }
                                    }
                                  }
                                }
                              }
                            } |
                            @purseVault!("transfer", to, amount, *payload.get("purseAuthKey"), *resultCh) |
                            for (@result <- resultCh) {
                              match result {
                                (true, Nil) => {
                                  for (counter <- counterCh) {
                                    counterCh!(*counter + 1) |
                                    // save new data
                                    @(*bagsData, "\${n}" %% { "n": *counter })!(*payload.get("data")) |
                                    // save new bag
                                    @(*bags, "\${n}" %% { "n": *counter })!({
                                      "quantity": *payload.get("quantity"),
                                      "publicKey": *payload.get("publicKey"),
                                      "nonce": *payload.get("nonce"),
                                      "n": bag.get("n"),
                                      "price": Nil,
                                    }) |
                                    for (ids <- bagsIds) {
                                      bagsIds!(*ids.union(Set("\${n}" %% { "n": *counter })))
                                    } |
                                    match bag.get("quantity") - *payload.get("quantity") == 0 {
                                      true => {
                                        stdout!("removing bag "++ *payload.get("bagId")++" because quantity 0") |
                                        // empty channel / remove bag
                                        for (_ <- @(*bags, *payload.get("bagId"))) { Nil } |
                                        // empty channel / remove data
                                        for (_ <- @(*bagsData, *payload.get("bagId"))) { Nil } |
                                        // remove id in bagsIds
                                        for (ids <- bagsIds) {
                                          bagsIds!(*ids.delete(*payload.get("bagId")))
                                        } |
                                        return!(true)
                                      }
                                      false => {
                                        for (bagToChange <- @(*bags, *payload.get("bagId"))) {
                                          @(*bags, *payload.get("bagId"))!(
                                            *bagToChange.set("quantity", *bagToChange.get("quantity") - *payload.get("quantity"))
                                          )
                                        } |
                                        return!(true)
                                      }
                                    }
                                  }
                                }
                                _ => {
                                  performRefundCh!("error: REV transfer went wrong")
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
              _ => {
                return!("error : not enough tokens in bag (bag ID: " ++ *payload.get("bagId") ++ ") available")
              }
            }
          }
        }
      }
    }
  } |

  contract sendCh(payload, signature, return) = {
    stdout!("sendCh") |
    for (@ids <<- bagsIds) {
      match ids.contains(*payload.get("bagId")) {
        false => {
          return!("error : token (bag ID) " ++ *payload.get("bagId") ++ " does not exist")
        }
        true => {
          for (@bag <<- @(*bags, *payload.get("bagId"))) {
            match [bag.get("quantity") - *payload.get("quantity") >= 0, *payload.get("quantity") > 0] {
              [true, true] => {
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
                        for (counter <- counterCh) {
                          counterCh!(*counter + 1) |
                          // Add bag data if found in payload
                          @(*bagsData, "\${n}" %% { "n": *counter })!(*payload.get("data")) |
                          // save new bag
                          @(*bags, "\${n}" %% { "n": *counter })!({
                            "quantity": *payload.get("quantity"),
                            "publicKey": *payload.get("publicKey"),
                            "nonce": *payload.get("nonce"),
                            "n": bag.get("n"),
                            "price": Nil,
                          }) |
                          for (ids <- bagsIds) {
                            bagsIds!(*ids.union(Set("\${n}" %% { "n": *counter })))
                          } |
                          match bag.get("quantity") - *payload.get("quantity") == 0 {
                            true => {
                              stdout!("removing bag "++ *payload.get("bagId")++" because quantity 0") |
                              // empty channel / remove bag
                              for (_ <- @(*bags, *payload.get("bagId"))) { Nil } |
                              // empty channel / remove data
                              for (_ <- @(*bagsData, *payload.get("bagId"))) { Nil } |
                              // remove id in bagsIds
                              for (ids <- bagsIds) {
                                bagsIds!(*ids.delete(*payload.get("bagId")))
                              } |
                              return!(true)
                            }
                            false => {
                              for (bagToChange <- @(*bags, *payload.get("bagId"))) {
                                @(*bags, *payload.get("bagId"))!(
                                  *bagToChange
                                    .set("quantity", *bagToChange.get("quantity") - *payload.get("quantity"))
                                    .set(
                                      "nonce",
                                      *payload.get("bagNonce")
                                    )
                                )
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
    }
  } |

  contract changePriceCh(payload, signature, return) = {
    stdout!("changePriceCh") |
    for (@ids <<- bagsIds) {
      match ids.contains(*payload.get("bagId")) {
        false => {
          return!("error : token (bag ID) " ++ *payload.get("bagId") ++ " does not exist")
        }
        true => {
          for (@bag <<- @(*bags, *payload.get("bagId"))) {
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
                    for (@bagToChange <- @(*bags, *payload.get("bagId"))) {
                      @(*bags, *payload.get("bagId"))!(
                        bagToChange
                          .set("price", *payload.get("price"))
                          .set("nonce", *payload.get("bagNonce"))
                      ) |
                      return!(true)
                    }
                  }
                  false => {
                    return!("error: Invalid signature, could not perform operation")
                  }
                }
              }
            }
          }
        }
      }
    }
  } |
  
  /*
    Returns values corresponding to ids
    channelToReadFrom: *bagsData, *bags or *tokensData
    ids: Set of strings / ids
    example iterateCh!((*bagsData, Set("1", "2", "18"), *return))
  */
  contract iterateCh(@(channelToReadFrom, ids, return)) = {
    new tmpCh, itCh in {
      for (@(tmpCh, ids) <= itCh) {
        match ids {
          Nil                 => @return!([])
          Set(last)           => {
            stdout!(("last", last)) |
            for (val <<- @(channelToReadFrom, last)) {
              for (tmp <- @tmpCh) {
                @return!(*tmp.set(last, *val))
              }
            }
          }
          Set(first ... rest) => {
            for (val <<- @(channelToReadFrom, first)) {
              for (tmp <- @tmpCh) {
                stdout!(("tmp", *tmp)) |
                @tmpCh!(*tmp.set(first, *val)) |
                itCh!((tmpCh, rest))
              }
            }
          }
        }
      } |
      tmpCh!({}) |
      itCh!((*tmpCh, ids))
    }
  } |

  contract entryCh(action, return) = {
    match *action.get("type") {
      // Read capabilities
      "READ_BAGS_IDS" => {
        for (ids <<- bagsIds) {
          return!(*ids)
        }
      }
      "READ_BAGS" => {
        match *action.get("payload").size() < 100 {
          true => {
            iterateCh!((*bags, *action.get("payload"), *return))
          }
          _ => {
            return!("error: payload must be a Set of strings with max size 100")
          }
        }
      }
      "READ_BAGS_DATA" => {
        match *action.get("payload").size() < 100 {
          true => {
            iterateCh!((*bagsData, *action.get("payload"), *return))
          }
          _ => {
            return!("error: payload must be a Set of strings with max size 100")
          }
        }
      }
      "READ_TOKENS_DATA" => {
        match *action.get("payload").size() < 100 {
          true => {
            iterateCh!((*tokensData, *action.get("payload"), *return))
          }
          _ => {
            return!("error: payload must be a Set of strings with max size 100")
          }
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
        match *action.get("payload").toByteArray().length() < 50000 {
          true => {
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
          false => {
            return!("error: payload size is limited to 50kb")
          }
        }
      }
      "CREATE_TOKENS" => {
        match *action.get("payload") {
          {
            "bags": _,
            "data": _,
/*             "bags": {
              [String]: {
                "nonce": String,
                "quantity": Int,
                "publicKey": String,
                "n": String,
                "price": Nil \\/ Int,
              }
            },
            "data": {
              [String]: _
            }, */
            "newNonce": String,
          } => {
            createCh!(
              *action.get("payload"),
              *action.get("signature"),
              *return
            )
          }
          _ => {
            return!("error: invalid payload, structure should be { 'newNonce': String, 'bagNonce': String, 'quantity': Int, 'n': String, 'price': Nil or Int, 'publicKey': String, 'data': Any }")
          }
        }
      }
      // Anyone capabilities
      "PURCHASE_TOKENS" => {
        match *action.get("payload").toByteArray().length() < 50000 {
          true => {
            match *action.get("payload") {
              { "quantity": Int, "bagId": String, "publicKey": String, "nonce": String, "data": _, "purseRevAddr": _, "purseAuthKey": _ } => {
                purchaseCh!(*action.get("payload"), *return)
              }
              _ => {
                return!("error: invalid payload, structure should be { 'quantity': Int, 'bagId': String, 'publicKey': String, 'nonce': String, 'data': Any, 'purseRevAddr': String, 'purseAuthKey': AuthKey }")
              }
            }
          }
          false => {
            return!("error: payload size is limited to 50kb")
          }
        }
      }
      "SEND_TOKENS" => {
        match *action.get("payload").toByteArray().length() < 50000 {
          true => {
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
          }
          false => {
            return!("error: payload size is limited to 50kb")
          }
        }
      }
      "CHANGE_PRICE" => {
        match *action.get("payload").toByteArray().length() < 50000 {
          true => {
            match *action.get("payload") {
              { "bagId": String, "price": Nil \\/ Int, "bagNonce": String } => {
                changePriceCh!(
                  *action.get("payload"),
                  *action.get("signature"),
                  *return
                )
              }
              _ => {
                return!("error: invalid payload, structure should be { 'price': Nil or Int, 'bagId': String, 'bagNonce': String }")
              }
            }
          }
          false => {
            return!("error: payload size is limited to 50kb")
          }
        }
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
      "version": "5.0.0"
    }) |
    stdout!({
      "registryUri": *entryUri,
      "locked": false,
      "publicKey": "${publicKey}",
      "nonce": "${newNonce}",
      "version": "5.0.0"
    })

    /*OUTPUT_CHANNEL*/
  }
}
`;
};
