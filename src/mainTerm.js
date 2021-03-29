module.exports.mainTerm = (fromBoxRegistryUri, payload) => {
    return `new 
  mainCh,

  entryCh,
  entryUriCh,
  iterateCh,
  makePurseCh,
  superKeyCh,

  /*
    vault stores the id for each purse unforgeable name, you
    must have a purse to receive / peek from *vault:
    // create purse "12"
    @(*vault, *purse)!("12")

    // peek and check purse
    for (id <<- @(*vault, *purse)) {
      out!(*purse) |
      // "12"
      for (purse <- @(*purses, "12")) {
        out!(*purse)
        // { "quantity": 100, "type": "GOLD", "publicKey": "aaa" }
      }
    }
  */
  vault,

  /*
    A purse's properties is a Map {"quantity", "type", "price", "publicKey"}
    stored in the channel *purses. Anyone can read it through
    "READ_PURSES" public channel.

    // create purse "12" (it must not exist)
    @(*purses, "12")!({ "publicKey": "aaa", etc... }) |

    // receive purse "12"
    for (purse <- @(*purses, "12")) {
      out!(*purse)
    }

    // peek purse "12"
    for (purse <<- @(*purses, "12")) {
      out!(*purse)
    }
  */
  purses,

  /*
    pursesIds is a Set with all ids of purses that have amount > 0
    for (ids <- pursesIds) { ... }
  */
  pursesIds,

  /*
    pursesData contains the data associated to purses
    for (data <- @(*pursesData, "12")) { ... }
  */
  pursesData,

  counterCh,

  insertArbitrary(\`rho:registry:insertArbitrary\`),
  stdout(\`rho:io:stdout\`),
  revAddress(\`rho:rev:address\`),
  registryLookup(\`rho:registry:lookup\`),
  deployerId(\`rho:rchain:deployerId\`)
in {

  counterCh!(0) |

  pursesIds!(Set()) |

  /*
    MAKE PURSE
    only place where new purses are created
    "MINT", "SWAP", "CREATE_PURSES" call this channel

    depending on if .fungible is true or false, it decides
    which id to give to the new purse, then it instantiates
    the purse with WITHDRAW, SWAP, BURN "instance channels"
  */
  for (@(properties, data, return) <= makePurseCh) {
    new idAndQuantityCh in {
      for (current <<- mainCh) {
        match *current.get("fungible") {
          true => {
            for (counter <- counterCh) {
              counterCh!(*counter + 1) |
              idAndQuantityCh!({ "id": "\${n}" %% { "n": *counter }, "quantity": properties.get("quantity") })
            }
          }
          false => {
            for (ids <<- pursesIds) {
              match *ids.contains(properties.get("id")) {
                true => {
                  match properties.get("id") {
                    "0" => {
                      match (properties.get("newId"), *ids.contains(properties.get("newId"))) {
                        (String, false) => {
                          idAndQuantityCh!({ "id": properties.get("newId"), "quantity": 1 })
                        }
                        _ => {
                          @return!("error: no .newId in payload or .newId already exists")
                        }
                      }
                    }
                    _ => {
                      @return!("error: purse ID already exists")
                    }
                  }
                }
                false => { idAndQuantityCh!({ "id": properties.get("id"), "quantity": properties.get("quantity") }) }
              }
            }
          }
        }
      } |
      for (idAndQuantity <- idAndQuantityCh) {
        match properties
          .set("id", *idAndQuantity.get("id"))
          .set("quantity", *idAndQuantity.get("quantity"))
          .delete("newId")
        {
          purseProperties => {
            match purseProperties {
              {
                "quantity": Int,
                // not used in main contract or box contract
                // only useful for dumping data
                "publicKey": String,
                "type": String,
                "id": String,
                "price": Nil \\/ Int
              } => {
                for (ids <- pursesIds) {
                  match *ids.contains(purseProperties.get("id")) {
                    false => {
                      pursesIds!(*ids.union(Set(purseProperties.get("id")))) |
                      @(*purses, purseProperties.get("id"))!(purseProperties) |
                      @(*pursesData, purseProperties.get("id"))!(data) |
                      new purse in {
                        @(*vault, *purse)!(purseProperties.get("id")) |
                        @return!(*purse) |

                        /*
                          READ
                          Returns prperties "id", "quantity", "type", "publicKey" and "price"(not implemented)
                          (Nil) => propertie
                        */
                        for (@(Nil, returnRead) <= @(*purse, "READ")) {
                          for (id <<- @(*vault, *purse)) {
                            for (props <<- @(*purses, *id)) {
                              @returnRead!(*props.set("id", *id))
                            }
                          }
                        } |

                        /*
                          SWAP
                          (Nil) => purse
                          Useful when you receive purse from unknown source, swap it
                          to make sure emitter did not keep a copy
                        */
                        for (@(publicKey, returnSwap) <= @(*purse, "SWAP")) {
                          match publicKey {
                            String => {
                              for (id <- @(*vault, *purse)) {
                                for (ids <- pursesIds) {
                                  pursesIds!(*ids.delete(*id)) |
                                  for (data <- @(*pursesData, *id)) {
                                    for (props <- @(*purses, *id)) {
                                      makePurseCh!((
                                        *props.set("publicKey", publicKey), *data, returnSwap
                                      ))
                                    }
                                  }
                                }
                              }
                            }
                            _ => {
                              @returnSwap!("error: public key must be a string")
                            }
                          }
                        } |

                        /*
                          UPDATE_DATA
                          (any) => string | (true, purse[])
                        */
                        for (@(payload, returnUpdateData) <= @(*purse, "UPDATE_DATA")) {
                          new readReturnCh in {
                            @(*purse, "READ")!((Nil, *readReturnCh)) |
                            for (@properties <- readReturnCh) {
                              for (_ <- @(*pursesData, properties.get("id"))) {
                                @(*pursesData, properties.get("id"))!(payload) |
                                @returnUpdateData!((true, Nil))
                              }
                            }
                          }
                        } |

                        /*
                          SET_PRICE
                          (payload: Int or Nil) => string | (true, Nil)
                        */
                        for (@(payload, returnSetPrice) <= @(*purse, "SET_PRICE")) {
                          match payload {
                            Int \\/ Nil => {
                              new boxEntryCh, receivePursesReturnCh, readReturnCh, makePurseReturnCh in {
                                @(*purse, "READ")!((Nil, *readReturnCh)) |
                                for (@properties1 <- readReturnCh) {
                                  for (@properties2 <- @(*purses, properties1.get("id"))) {
                                    @(*purses, properties1.get("id"))!(
                                      properties2.set("price", payload)
                                    ) |
                                    @returnSetPrice!((true, Nil))
                                  }
                                }
                              }
                            }
                            _ => {
                              @returnSetPrice!("error: payload must be an integer or Nil")
                            }
                          }
                        } |

                        /*
                          WITHDRAW
                          (payload: Int) => string | (true, purse)
                        */
                        for (@(payload, returnWithdraw) <= @(*purse, "WITHDRAW")) {
                          match payload {
                            Int => {
                              new boxEntryCh, receivePursesReturnCh, readReturnCh, makePurseReturnCh in {
                                @(*purse, "READ")!((Nil, *readReturnCh)) |
                                for (@properties1 <- readReturnCh) {
                                  match (
                                    /*
                                      The remaining cannot be 0, if you want to send
                                      the whole purse, just hand the *purse object to someone's box
                                    */
                                    properties1.get("quantity") > payload,
                                    payload > 0
                                  ) {
                                    (true, true) => {
                                      /*
                                        change quantity in *purse, and create a new purse
                                        with [payload] quantity
                                      */
                                      for (@properties2 <- @(*purses, properties1.get("id"))) {
                                        @(*purses, properties1.get("id"))!(
                                          properties2.set("quantity", properties2.get("quantity") - payload)
                                        ) |
                                        makePurseCh!((
                                          properties2.set("quantity", payload).set("price", Nil), Nil, *makePurseReturnCh
                                        )) |
                                        for (newPurse <- makePurseReturnCh) {
                                          @returnWithdraw!((true, *newPurse))
                                        }
                                      }
                                    }
                                    _ => {
                                      @returnWithdraw!("error: quantity invalid, remaining cannot be zero")
                                    }
                                  }
                                }
                              }

                            }
                            _ => {
                              @returnWithdraw!("error: payload must be an integer")
                            }
                          }
                        } |

                        /*
                          DEPOSIT
                          (payload: purse) => string | (true, Nil)
                        */
                        for (@(payload, returnDeposit) <= @(*purse, "DEPOSIT")) {
                          new boxEntryCh, receivePursesReturnCh, readReturnCh in {
                            @(*purse, "READ")!((Nil, *readReturnCh)) |
                            for (@properties1 <- readReturnCh) {
                              for (id <<- @(*vault, payload)) {
                                for (@properties2 <<- @(*purses, *id)) {
                                  match (
                                    properties2.get("quantity"),
                                    properties2.get("quantity") > 0,
                                    properties1.get("type") == properties2.get("type"),
                                    properties1.get("price")
                                  ) {
                                    (Int, true, true, Nil) => {
                                      for (_ <- @(*vault, payload)) { Nil } |
                                      for (ids <- pursesIds) {
                                        pursesIds!(*ids.delete(*id))
                                      } |
                                      for (_ <- @(*pursesData, *id)) { Nil } |
                                      for (_ <- @(*purses, *id)) { Nil } |
                                      for (@properties <- @(*purses, properties1.get("id"))) {
                                        @(*purses, properties1.get("id"))!(
                                          properties.set(
                                            "quantity",
                                            properties.get("quantity") + properties2.get("quantity")
                                          )
                                        ) |
                                        @returnDeposit!((true, Nil))
                                      }
                                    }
                                    _ => {
                                      @returnDeposit!("error: cannot deposit to a purse with .price not Nil")
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                    true => {
                      pursesIds!(*ids) |
                      @return!("error: purse ID already exists")
                    }
                  }
                }
              }
              _ => {
                @return!("error: invalid purse")
              }
            }
          }
        }
      }
    }
  } |

  // ====================================
  // SUPER / ADMIN / OWNER capabilities (if not locked)
  // You must have the superKeyCh to perform those operations
  // ====================================

  for (@(Nil, return) <= @(*superKeyCh, "LOCK")) {
    for (@current <<- mainCh) {
      match current.get("locked") {
        true => {
          @return!("error: contract is locked")
        }
        false => {
          for (current <- mainCh) {
            mainCh!(*current.set("locked", true)) |
            @return!((true, Nil))
          }
        }
      }
    }
  } |

  for (@(payload, return) <= @(*superKeyCh, "CREATE_PURSES")) {
    for (@current <<- mainCh) {
      match current.get("locked") {
        true => {
          @return!("error: contract is locked")
        }
        false => {
          new itCh, createdPursesesCh, saveKeyAndBagCh in {
            createdPursesesCh!([]) |
            itCh!((payload.get("purses").keys(), payload.get("purses"), payload.get("data"))) |
            for(@(set, newPurses, newData) <= itCh) {
              match set {
                Nil => {}
                Set(last) => {
                  new retCh in {
                    makePurseCh!((newPurses.get(last), newData.get(last), *retCh)) |
                    for (purse <- retCh) {
                      match *purse {
                        String => {
                          @return!(*purse)
                        }
                        _ => {
                          for (createdPurses <- createdPursesesCh) {
                            @return!((true, { "purses": *createdPurses ++ [*purse] }))
                          }
                        }
                      }
                    }
                  }
                }
                Set(first ... rest) => {
                  new retCh in {
                    makePurseCh!((newPurses.get(first), newData.get(first), *retCh)) |
                    for (purse <- retCh) {
                      match *purse {
                        String => {
                          @return!(*purse)
                        }
                        _ => {
                          for (createdPurses <- createdPursesesCh) {
                            createdPursesesCh!(*createdPurses ++ [*purse]) |
                            itCh!((rest, newPurses, newData))
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

  /*
    Returns values corresponding to ids, "PUBLIC_READ_PURSES"
    and "PUBLIC_PUBLIC_READ_PURSES_DATA" call this channel

    channelToReadFrom: *pursesData or *purses
    ids: Set purse ids (they must all exist)
    example iterateCh!((*pursesData, Set("1", "2", "18"), *return))
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


  // ====================================
  // ===== ANY USER / PUBLIC capabilities
  // ====================================

  for (@("PUBLIC_READ_PURSES_IDS", payload, return) <= entryCh) {
    for (ids <<- pursesIds) {
      @return!(*ids)
    }
  } |

  for (@("PUBLIC_READ_PURSES", payload, return) <= entryCh) {
    match payload.size() < 101 {
      true => {
        iterateCh!((*purses, payload, return))
      }
      _ => {
        @return!("error: payload must be a Set of strings with max size 100")
      }
    }
  } |

  for (@("PUBLIC_READ_PURSES_DATA", payload, return) <= entryCh) {
    match payload.size() < 101 {
      true => {
        iterateCh!((*pursesData, payload, return))
      }
      _ => {
        @return!("error: payload must be a Set of strings with max size 100")
      }
    }
  } |

  for (@("PUBLIC_READ", payload, return) <= entryCh) {
    for (current <<- mainCh) {
      @return!(*current)
    }
  } |

  /*
    (purse[]) => String | (true, id[])
    receives a list of purse, check that (they exist + no duplicate)
    and returns the corresponding list of ids
  */
  for (@("PUBLIC_CHECK_PURSES", payload, return) <= entryCh) {
    new tmpCh, itCh in {
      for (@(tmpCh, keys) <= itCh) {
        for (tmp <- @tmpCh) {
          match keys {
            Nil => {
              @return!(*tmp)
            }
            [last] => {
              for (id <<- @(*vault, last)) {
                match *tmp.union(Set(*id)).size() == payload.length() {
                  true => {
                    @return!((true, *tmp.union(Set(*id))))

                  }
                  false => {
                    @return!("error: duplicates")
                  }
                }
              }
            }
            [first ... rest] => {
              for (id <<- @(*vault, first)) {
                @tmpCh!(*tmp.union(Set(*id))) |
                itCh!((tmpCh, rest))
              }
            }
          }
        }
      } |
      tmpCh!(Set()) |
      itCh!((*tmpCh, payload))
    }
  } |

  /*
    (payload) => String | (true, purse)
    purchase with REV from a purse that has .price
    property not Nil
    see payload below
  */
  // todo limitation total payload size ??
  for (@("PUBLIC_PURCHASE", payload, return) <= entryCh) {
    match payload {
      { "quantity": Int, "purseId": String, "publicKey": String,
      "newId": Nil \\/ String, "data": _, "purseRevAddr": _, "purseAuthKey": _ } => {
        for (@properties <<- @(*purses, payload.get("purseId"))) {
          match (
            properties.get("price"),
            properties.get("quantity") > 0,
            payload.get("quantity") > 0,
            properties.get("quantity") >= payload.get("quantity")
          ) {
            (Int, true, true, true) => {
              new revVaultCh, ownerRevAddressCh, purseVaultCh in {

                registryLookup!(\`rho:rchain:revVault\`, *revVaultCh) |
                revAddress!("fromPublicKey", properties.get("publicKey").hexToBytes(), *ownerRevAddressCh) |

                for (@(_, RevVault) <- revVaultCh; @ownerRevAddress <- ownerRevAddressCh) {
                  match (
                    payload.get("purseRevAddr"),
                    ownerRevAddress,
                    payload.get("quantity") * properties.get("price")
                  ) {
                    (from, to, amount) => {
                      @RevVault!("findOrCreate", from, *purseVaultCh) |
                      for (@(true, purseVault) <- purseVaultCh) {
                        new makePurseReturnCh, transferReturnCh, performRefundCh in {                        
                          // refund
                          for (@message <- performRefundCh) {
                            new refundPurseBalanceCh, refundRevAddressCh, refundResultCh in {
                              @purseVault!("balance", *refundPurseBalanceCh) |
                              revAddress!("fromPublicKey", payload.get("publicKey").hexToBytes(), *refundRevAddressCh) |
                              for (@balance <- refundPurseBalanceCh; @revAddress <- refundRevAddressCh) {
                                @purseVault!("transfer", revAddress, balance, payload.get("purseAuthKey"), *refundResultCh) |
                                for (@refundResult <- refundResultCh) {
                                  match refundResult {
                                    (true, Nil) => {
                                      stdout!(message ++ ", issuer was refunded") |
                                      @return!(message ++ ", issuer was refunded")
                                    }
                                    _ => {
                                      stdout!(message ++ ", issuer was NOT refunded") |
                                      @return!(message ++ ", issuer was NOT refunded")
                                    }
                                  }
                                }
                              }
                            }
                          } |
                          @purseVault!("transfer", to, amount, payload.get("purseAuthKey"), *transferReturnCh) |
                          for (@result <- transferReturnCh) {
                            match result {
                              (true, Nil) => {
                                for (@properties2 <- @(*purses, payload.get("purseId"))) {
                                  /*
                                    Check if the purse must be removed because quantity 0
                                    if fungible: false, we always match 0
                                  */
                                  match properties2.get("quantity") - payload.get("quantity") {
                                    0 => {
                                      for (ids <- pursesIds) {
                                        pursesIds!(*ids.delete(properties2.get("id"))) |
                                        for (_ <- @(*pursesData, properties2.get("id"))) {
                                          makePurseCh!((
                                            properties2
                                              .set("price", Nil)
                                              .set("newId", payload.get("newId"))
                                              .set("quantity", payload.get("quantity"))
                                              .set("publicKey", payload.get("publicKey")),
                                            payload.get("data"),
                                            *makePurseReturnCh
                                          )) |
                                          for (newPurse <- makePurseReturnCh) {
                                            @return!((true, *newPurse))
                                          }
                                        }
                                      }
                                    }
                                    _ => {
                                      @(*purses, properties2.get("id"))!(
                                        properties2.set("quantity", properties2.get("quantity") - payload.get("quantity"))
                                      ) |
                                      makePurseCh!((
                                        properties2
                                          .set("price", Nil)
                                          .set("newId", payload.get("newId"))
                                          .set("quantity", payload.get("quantity"))
                                          .set("publicKey", payload.get("publicKey")),
                                        payload.get("data"),
                                        *makePurseReturnCh
                                      )) |
                                      for (newPurse <- makePurseReturnCh) {
                                        stdout!(*newPurse) |
                                        @return!((true, *newPurse))
                                      }
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
            _=> {
              @return!("error: quantity not available or purse not for sale")
            }
          }
        }
      }
      _ => {
        @return!("error: invalid payloads")
      }
    }
  } |


  // ====================================
  // ===================== INITIALIZATION
  // save superKeyCh to a box
  // ====================================

  insertArbitrary!(bundle+{*entryCh}, *entryUriCh) |

  for (entryUri <- entryUriCh) {
    new boxDataCh, boxReturnCh in {
      @(*deployerId, "rho:id:${fromBoxRegistryUri}")!(({ "type": "READ" }, *boxDataCh)) |
      for (r <- boxDataCh) {
      stdout!(*r) |
        match (*r.get("version")) {
          "5.0.1" => {
            @(*deployerId, "rho:id:${fromBoxRegistryUri}")!((
              {
                "type": "SAVE_SUPER_KEY",
                "payload": { "superKey": *superKeyCh, "registryUri": *entryUri }
              },
              *boxReturnCh
            )) |
            for (resp <- boxReturnCh) {
              match *resp {
                String => {
                  mainCh!({ "status": "failed", "message": *resp }) |
                  stdout!(("failed", *resp))
                }
                _ => {
                  mainCh!({
                    "status": "completed",
                    "registryUri": *entryUri,
                    "locked": false,
                    "fungible": ${payload.fungible},
                    "version": "5.0.1"
                  }) |
                  stdout!({
                    "status": "completed",
                    "registryUri": *entryUri,
                    "locked": false,
                    "fungible": ${payload.fungible},
                    "version": "5.0.1"
                  }) |
                  stdout!("completed, contract deployed")
                }
              }
            }
          }
          _ => {
            mainCh!({
              "status": "failed",
              "message": "box has not the same version number 5.0.1",
            }) |
            stdout!({
              "status": "failed",
              "message": "box has not the same version number 5.0.1",
            })
          }
        }
      }
    }

    /*OUTPUT_CHANNEL*/
  }
}
`;
};
