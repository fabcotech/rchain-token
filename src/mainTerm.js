module.exports.mainTerm = (newNonce, publicKey) => {
    return `new 
  mainCh,

  createCh,
  refundCh,
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

  insertArbitrary(\`rho:registry:insertArbitrary\`),
  stdout(\`rho:io:stdout\`),
  secpVerify(\`rho:crypto:secp256k1Verify\`),
  blake2b256(\`rho:crypto:blake2b256Hash\`),
  revAddress(\`rho:rev:address\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  /*
    BAGS
    bags are stored in a tuple-based channel, example bag 12:
    @(*bags, 12)!({ "publicKey": "aaa", etc... })

    bagsIds is a Set with all bags that contain at least one token
  */
  bagsIds!(Set()) |
  /*DEFAULT_BAGS_IDS*/
  /*DEFAULT_BAGS*/

  /*
    BAGS DATA
    bags data are stored in a tuple-based channel, example bag 12:
    @(*bagsData, 12)!("red")
  */
  /*DEFAULT_BAGS_DATA*/

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
                        for (ids <- bagsIds) {
                          bagsIds!(*ids.union(Set(last)))
                        } |
                        @(*bags, last)!(newBags.get(last)) |
                        @(*bagsData, last)!(newData.get(last))
                      }
                      Set(first ... rest) => {
                        iterateCh2!((rest, newBags, newData)) |
                        for (ids <- bagsIds) {
                          bagsIds!(*ids.union(Set(first)))
                        } |
                        @(*bags, first)!(newBags.get(first)) |
                        @(*bagsData, first)!(newData.get(first))
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

  contract refundCh(payload, message, return) = {
    stdout!("refundCh") |
    new RevVaultCh, emitterRevAddressCh, purseVaultCh, balanceCh in {
      registryLookup!(\`rho:rchain:revVault\`, *RevVaultCh) |
      revAddress!("fromPublicKey", *payload.get("publicKey").hexToBytes(), *emitterRevAddressCh) |
      for (@(_, RevVault) <- RevVaultCh; @emitterRevAddress <- emitterRevAddressCh) {
        match (
          *payload.get("purseRevAddr"),
          emitterRevAddress,
        ) {
          (from, to) => {
            @RevVault!("findOrCreate", from, *purseVaultCh) |
            for (@(true, purseVault) <- purseVaultCh) {
              @purseVault!("balance", *balanceCh) |
              for (balance <- balanceCh) {
                new resultCh in {
                  @purseVault!("transfer", to, *balance, *payload.get("purseAuthKey"), *resultCh) |
                  for (@result <- resultCh) {
                    match result {
                      (true, Nil) => {
                        stdout!("refund went well") |
                        return!(*message ++ ", issuer was refunded \${b}" %% { "b": *balance })
                      }
                      _ => {
                        stdout!("error: refund DID NOT go well") |
                        return!(*message ++ ", issuer was NOT refunded")
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

  // purchase token (1 or more)
  contract purchaseCh(payload, return) = {
    stdout!("purchaseCh") |
    for (@ids <<- bagsIds) {
      match ids.contains(*payload.get("bagId")) {
        false => {
          refundCh!(*payload, "error : token (bag ID) " ++ *payload.get("bagId") ++ " does not exist", *return)
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
                          new resultCh in {                        
                            match (*payload.get("bagId") == "0", ids.contains(*payload.get("newBagId"))) {
                              (true, true) => {
                                refundCh!(*payload, "error: you are buying from bag 0 but new bag "++*payload.get("newBagId")++" already exists", *return)
                              }
                              _ => {
                                match (*payload.get("bagId") == "0", *payload.get("newBagId").length() > 50) {
                                  (true, true) => {
                                    refundCh!(*payload, "error: new bag id max size is 50", *return)
                                  }
                                  _ => {
                                    @purseVault!("transfer", to, amount, *payload.get("purseAuthKey"), *resultCh)
                                  }
                                }
                              }
                            } |
                            for (@result <- resultCh) {
                              match result {
                                (true, Nil) => {
                                  match *payload.get("bagId") == "0" {
                                    true => {
                                      // purchase from bag "0"
                                      // creating a bag with new bag ID is allowed
                                      for (bag0 <- @(*bags, "0")) {
                                        @(*bags, "0")!(*bag0.set("quantity", *bag0.get("quantity") - 1))
                                      } |
                                      // bag data
                                      for (_ <- @(*bagsData,  *payload.get("newBagId"))) {
                                        @(*bagsData,  *payload.get("newBagId"))!(*payload.get("data"))
                                      } |
                                      @(*bagsData,  *payload.get("newBagId"))!(*payload.get("data")) |
                                      // bag
                                      @(*bags, *payload.get("newBagId"))!({
                                        "quantity": *payload.get("quantity"),
                                        "publicKey": *payload.get("publicKey"),
                                        "nonce": *payload.get("nonce"),
                                        "n": bag.get("n"),
                                        "price": Nil,
                                      }) |
                                      for (ids <- bagsIds) {
                                        bagsIds!(*ids.union(Set(*payload.get("newBagId"))))
                                      } |
                                      return!(true)
                                    }
                                    false => {
                                      // purchase from bag other than "0"
                                      // creating a bag with new bag ID is NOT allowed
                                      // buyer takes control of the bag
                                      // bag
                                      for (bag <- @(*bags, *payload.get("bagId"))) {
                                        @(*bags, *payload.get("bagId"))!(
                                          *bag
                                            .set("publicKey", *payload.get("publicKey"))
                                            .set("nonce", *payload.get("nonce"))
                                            .set("price", Nil)
                                        )
                                      } |
                                      // bag data
                                      for (_ <- @(*bagsData,  *payload.get("bagId"))) {
                                        @(*bagsData,  *payload.get("bagId"))!(*payload.get("data"))
                                      } |
                                      @(*bagsData,  *payload.get("bagId"))!(*payload.get("data")) |
                                      return!(true)
                                    }
                                  }
                                }
                                _ => {
                                  refundCh!(*payload, "error: REV transfer went wrong", *return)
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
                refundCh!(*payload, "error : not enough tokens in bag (bag ID: " ++ *payload.get("bagId") ++ ") available", *return)
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
          match ids.contains(*payload.get("newBagId")) {
            true => {
              return!("error : bag id " ++ *payload.get("newBagId") ++ " already exists")
            }
            false => {
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
                            // Add bag data if found in payload
                            for (_ <- @(*bagsData, *payload.get("newBagId"))) {
                              @(*bagsData, *payload.get("newBagId"))!(*payload.get("data"))
                            } |
                            @(*bagsData, *payload.get("newBagId"))!(*payload.get("data")) |
                            // save new bag
                            @(*bags, *payload.get("newBagId"))!({
                              "quantity": 1,
                              "publicKey": *payload.get("publicKey"),
                              "nonce": *payload.get("bagNonce2"),
                              "n": bag.get("n"),
                              "price": Nil,
                            }) |
                            for (ids <- bagsIds) {
                              bagsIds!(*ids.union(Set(*payload.get("newBagId"))))
                            } |
                            for (bag0 <- @(*bags, "0")) {
                              @(*bags, "0")!(
                                *bag0
                                  .set("quantity", *bag0.get("quantity") - 1)
                                  .set("nonce", *payload.get("bagNonce"))
                              )
                            } |
                            return!(true)
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
        for (tmp <- @tmpCh) {
          match ids {
            Nil => {
              @return!(*tmp)
            }
            Set(last) => {
              for (val <<- @(channelToReadFrom, last)) {
                @return!(*tmp.set(last, *val))
              }
            }
            Set(first ... rest) => {
              for (val <<- @(channelToReadFrom, first)) {
                @tmpCh!(*tmp.set(first, *val))
              } |
              itCh!((tmpCh, rest))
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
              { "quantity": 1, "bagId": String, "newBagId": String, "publicKey": String, "nonce": String, "data": _, "purseRevAddr": _, "purseAuthKey": _ } => {
                purchaseCh!(*action.get("payload"), *return)
              }
              _ => {
                return!("error: invalid payload, structure should be { 'quantity': Int, 'bagId': String, 'newBagId': String, 'publicKey': String, 'nonce': String, 'data': Any, 'purseRevAddr': String, 'purseAuthKey': AuthKey }")
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
              { "quantity": Int, "bagId": "0", "newBagId": String, "publicKey": String, "bagNonce": String, "bagNonce2": String, "data": _, } => {
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
