module.exports.mainTerm = (fromBoxRegistryUri, payload) => {
    return `new 
  mainCh,

  entryCh,
  entryUriCh,
  iterateDataCh,
  iteratePropertiesCh,
  makePurseCh,
  superKeyCh,
  calculateFeeCh,
  pursesTreeHashMapCh,
  pursesForSaleTreeHashMapCh,

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
        // { "quantity": 100, "type": "GOLD", "box": \`rho:id:aaa\`, "publicKey": "aaa", }
      }
    }
  */
  vault,

  /*
    purses / thm
    A purse's properties is a Map {"quantity", "type", "price", "box", "publicKey"}
    stored in the tree hash map *purses. Anyone can read it through
    "READ_PURSES" public channel.

    // create purse "12" (it must not exist)
    purses!("set", thm, "12", { "publicKey": "aaa", "box": \`rho:id:aaa\`, etc... }, *setReturnCh) |

    // get properties of purse "12"
    purses!("get", thm, "12", *getReturnCh) |
    for (properties <- getReturnCh) {
      out!(*properties)
    }

  */
  pursesReadyCh,

  /*
    pursesForSale / thm2
    TreeHashMap of purses currently for sale
    @pursesForSale!("set", thm2, "12", purse, *setReturnCh) |
  */
  pursesForSaleReadyCh,


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

  registryLookup!(\`rho:lang:treeHashMap\`, *pursesTreeHashMapCh) |
  registryLookup!(\`rho:lang:treeHashMap\`, *pursesForSaleTreeHashMapCh) |
  for(purses <- pursesTreeHashMapCh; pursesForSale <- pursesForSaleTreeHashMapCh) {
    stdout!(("ok1", *purses)) |
    stdout!(("ok2", *pursesForSale)) |
    new thmReturnCh, thm2ReturnCh in {
      purses!("init", 3, *thmReturnCh) |
      pursesForSale!("init", 3, *thm2ReturnCh) |
      for (thm <- thmReturnCh; thm2 <- thm2ReturnCh) {
        stdout!(("init1", *thm)) |
        stdout!(("init2", *thm2)) |
        pursesReadyCh!((*purses, *thm)) |
        pursesForSaleReadyCh!((*pursesForSale, *thm2))
      }
    }
  } |
  for (@(purses, thm) <- pursesReadyCh; @(pursesForSale, thm2) <- pursesForSaleReadyCh) {
    stdout!(("pursesReadyCh", "pursesForSaleReadyCh")) |
    /*
      MAKE PURSE
      only place where new purses are created
      "WITHDRAW", "PURCHASE", "SWAP", "CREATE_PURSES" call this channel

      depending on if .fungible is true or false, it decides
      which id to give to the new purse, then it creates
      the purse with SWAP, UPDATE_DATA, SET_PRICE, WITHDRAW, DEPOSIT instance methods
    */
    for (@(properties, data, return) <= makePurseCh) {
      new idAndQuantityCh, thmGetReturnCh, thmGetReturn2Ch, thmGetReturn3Ch in {
        for (current <<- mainCh) {
          if (*current.get("fungible") == true) {
            for (counter <- counterCh) {
              counterCh!(*counter + 1) |
              idAndQuantityCh!({ "id": "\${n}" %% { "n": *counter }, "quantity": properties.get("quantity") })
            }
          } else {
            @purses!("get", thm, properties.get("id"), *thmGetReturnCh) |
            for (@properties <- thmGetReturnCh) {
              if (properties == Nil) {
                idAndQuantityCh!({ "id": properties.get("id"), "quantity": properties.get("quantity") })
              } else {
                if (properties.get("id") == "0") {
                  @purses!("get", thm, properties.get("newId"), *thmGetReturn2Ch) |
                  for (properties2 <- thmGetReturn2Ch) {
                    match (properties.get("newId"), *properties2) {
                      (String, Nil) => {
                        idAndQuantityCh!({ "id": properties.get("newId"), "quantity": 1 })
                      }
                      _ => {
                        @return!("error: no .newId in payload or .newId already exists")
                      }
                    }
                  }
                } else {
                  @return!("error: purse ID already exists")
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
                  // .box may is used to deploy other contracts
                  // and send purses to existing owners
                  "box": URI,
                  // .publicKey is used if purse is sold
                  "publicKey": String,
                  "type": String,
                  "id": String,
                  "price": Nil \\/ Int
                } => {
                  new purse, setReturnCh in {
                    @purses!("set", thm, purseProperties.get("id"), purseProperties, *setReturnCh) |
                    for (_ <- setReturnCh) {

                      @(*pursesData, purseProperties.get("id"))!(data) |
                      @(*vault, *purse)!(purseProperties.get("id")) |
                      @return!(bundle+{*purse}) |

                      /*
                        READ
                        Returns properties "id", "quantity", "type", "box" and "price"
                        (Nil) => propertie
                      */
                      for (@("READ", Nil, returnRead) <= purse) {
                        for (id <<- @(*vault, *purse)) {
                          @purses!("get", thm, *id, returnRead)
                        }
                      } |

                      /*
                        SWAP
                        (payload: { box: URI, publicKey: String }) => String | (true, purse)
                        Useful when you receive purse from unknown source, swap it
                        to make sure emitter did not keep a copy
                      */
                      for (@("SWAP", payload, returnSwap) <= purse) {
                        match (payload.get("box"), payload.get("publicKey")) {
                          (URI, String) => {
                            for (id <- @(*vault, *purse)) {
                              stdout!(("purse.SWAP", *id)) |
                              new setReturnCh, setForSaleReturnCh, getReturnCh, makePurseReturnCh in {
                                @purses!("get", thm, *id, *getReturnCh) |
                                for (properties <- getReturnCh) {
                                  if (*properties == Nil) {
                                    @returnSwap!("error: purse is worthless")
                                  } else {
                                    // todo remove key in treeHashMap instead of set Nil
                                    // not implemented in rnode yet
                                    @purses!("set", thm, *id, Nil, *setReturnCh) |
                                    @pursesForSale!("set", thm2, *id, Nil, *setForSaleReturnCh) |
                                    for (_ <- setReturnCh; _ <- setForSaleReturnCh; data <- @(*pursesData, *id)) {
                                      stdout!(("purse.SWAP successful", *id)) |
                                      makePurseCh!((
                                        *properties
                                          .set("box", payload.get("box"))
                                          .set("publicKey", payload.get("publicKey")),
                                        *data,
                                        makePurseReturnCh
                                      )) |
                                      for (newPurse <- makePurseReturnCh) {
                                        match *newPurse {
                                          String => {
                                            @returnSwap!("error: makePurse went wrong " ++ *newPurse)
                                          }
                                          _ => {
                                             @returnSwap!((true, *newPurse))
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
                            @returnSwap!("error: payload must be box: URI, publicKey: String")
                          }
                        }
                      } |

                      /*
                        UPDATE_DATA
                        (payload: any) => String | (true, Nil)
                      */
                      for (@("UPDATE_DATA", payload, returnUpdateData) <= purse) {
                        new getReturnCh in {
                          for (id <<- @(*vault, *purse)) {
                            stdout!(("purse.UPDATE_DATA", *id)) |
                            @purses!("get", thm, *id, *getReturnCh) |
                            for (properties <- getReturnCh) {
                              if (*properties == Nil) {
                                @returnUpdateData!("error: purse is worthless")
                              } else {
                                for (_ <- @(*pursesData, *id)) {
                                  stdout!(("purse.UPDATE_DATA successful", *id)) |
                                  @(*pursesData, *id)!(payload) |
                                  @returnUpdateData!((true, Nil))
                                }
                              }
                            }
                          }
                        }
                      } |

                      /*
                        SET_PRICE
                        (payload: Int or Nil) => String | (true, Nil)
                      */
                      for (@("SET_PRICE", payload, returnSetPrice) <= purse) {
                        match payload {
                          Int \\/ Nil => {
                            new setReturnCh, getReturnCh, setForSaleReturnCh in {
                              for (id <<- @(*vault, *purse)) {
                                stdout!(("purse.SET_PRICE", *id)) |
                                @purses!("get", thm, *id, *getReturnCh) |
                                for (properties <- getReturnCh) {
                                  if (*properties == Nil) {
                                    @returnSetPrice!("error: purse is worthless")
                                  } else {
                                    @purses!("set", thm, *id, *properties.set("price", payload), *setReturnCh) |
                                    for (_ <- setReturnCh) {
                                      stdout!(("purse.SET_PRICE successful", *id)) |
                                      match payload {
                                        Int => {
                                          @pursesForSale!("set", thm2, *id, *purse, *setForSaleReturnCh) |
                                          for (_ <- setForSaleReturnCh) {
                                            @returnSetPrice!((true, Nil))
                                          }
                                        }
                                        Nil => {
                                          @pursesForSale!("set", thm2, *id, Nil, *setForSaleReturnCh) |
                                          for (_ <- setForSaleReturnCh) {
                                            @returnSetPrice!((true, Nil))
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
                            @returnSetPrice!("error: payload must be an integer or Nil")
                          }
                        }
                      } |

                      /*
                        WITHDRAW
                        (payload: Int) => String | (true, purse)
                      */
                      for (@("WITHDRAW", payload, returnWithdraw) <= purse) {
                        match payload {
                          Int => {
                            new getReturnCh, makePurseReturnCh, setReturnCh in {
                              for (id <<- @(*vault, *purse)) {
                                stdout!(("purse.WITHDRAW", *id)) |
                                @purses!("get", thm, *id, *getReturnCh) |
                                for (@properties <- getReturnCh) {
                                  if (properties == Nil) {
                                    @returnWithdraw!("error: purse is worthless")
                                  } else {
                                    match (
                                      /*
                                        The remaining cannot be 0, if you want to send
                                        the whole purse, just hand the *purse object to someone's box
                                      */
                                      properties.get("quantity") > payload,
                                      payload > 0
                                    ) {
                                      (true, true) => {
                                        /*
                                          change quantity in *purse, and create a new purse
                                          with [payload] quantity
                                        */
                                        @purses!("set", thm, properties.get("id"), properties.set("quantity", properties.get("quantity") - payload), *setReturnCh) |
                                        for (_ <- setReturnCh) {
                                          makePurseCh!((
                                            properties.set("quantity", payload).set("price", Nil), Nil, *makePurseReturnCh
                                          )) |
                                          for (newPurse <- makePurseReturnCh) {
                                            stdout!(("purse.WITHDRAW successful", *id)) |
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
                            }

                          }
                          _ => {
                            @returnWithdraw!("error: payload must be an integer")
                          }
                        }
                      } |


                      /*
                        DEPOSIT
                        (payload: purse) => String | (true, Nil)
                      */
                      for (@("DEPOSIT", payload, returnDeposit) <= purse) {
                        new proceedCh, receivePursesReturnCh, getReturnCh, getReturn2Ch, setReturnCh, setReturn2Ch in {
                          for (current <<- mainCh) {
                            if (*current.get("fungible") == true) {
                              proceedCh!(Nil)
                            } else {
                              @returnDeposit!("error: cannot deposit in a fungible = false contract")
                            }
                          } |
                          for (_ <- proceedCh) {
                            for (id <<- @(*vault, *purse); depositedPurseId <<- @(*vault, payload)) {
                              stdout!(("purse.DEPOSIT", *id)) |
                              @purses!("get", thm, *id, *getReturnCh) |
                              @purses!("get", thm, *depositedPurseId, *getReturn2Ch) |
                              for (@properties1 <- getReturnCh; @properties2 <- getReturn2Ch) {
                                match (
                                  properties1 != Nil,
                                  properties2 != Nil,
                                  *depositedPurseId != *id,
                                  properties2.get("quantity"),
                                  properties2.get("quantity") > 0,
                                  properties1.get("type") == properties2.get("type"),
                                  properties1.get("price")
                                ) {
                                  (true, true, true, Int, true, true, Nil) => {
                                    // delete purse [payload], and remove data
                                    @purses!("set", thm, *depositedPurseId, Nil, *setReturnCh) |
                                    for (_ <- @(*vault, payload); _ <- @(*pursesData, *depositedPurseId); _ <- setReturnCh) {

                                      // set new quantity in purse
                                      @purses!("set", thm, *id, properties1.set(
                                          "quantity",
                                          properties1.get("quantity") + properties2.get("quantity")
                                        ), *setReturn2Ch) |
                                      for (_ <- setReturn2Ch) {
                                        stdout!(("purse.DEPOSIT successful", *id)) |
                                        @returnDeposit!((true, Nil))
                                      }
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

    contract iterateDataCh(@(ids, return)) = {
      new tmpCh, itCh in {
        for (@(tmpCh, ids) <= itCh) {
          for (tmp <- @tmpCh) {
            match ids {
              Nil => {
                @return!(*tmp)
              }
              Set(last) => {
                for (val <<- @(*pursesData, last)) {
                  @return!(*tmp.set(last, *val))
                }
              }
              Set(first ... rest) => {
                for (val <<- @(*pursesData, first)) {
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

    contract iteratePropertiesCh(@(ids, return)) = {
      new tmpCh, itCh in {
        for (@(tmpCh, ids) <= itCh) {
          for (tmp <- @tmpCh) {
            match ids {
              Nil => {
                @return!(*tmp)
              }
              Set(last) => {
                new retCh in {
                  @purses!("get", thm, last, *retCh) |
                  for (properties <- retCh) {
                    @return!(*tmp.set(last, *properties))
                  }
                }
              }
              Set(first ... rest) => {
                new retCh in {
                  @purses!("get", thm, first, *retCh) |
                  for (properties <- retCh) {
                    @tmpCh!(*tmp.set(first, *properties)) |
                    itCh!((tmpCh, rest))
                  }
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

    // todo .keySet
    for (@("PUBLIC_READ_PURSES_IDS", payload, return) <= entryCh) {
      @return!(Set())
      /* for (ids <<- pursesIds) {
        @return!(*ids)
      } */
    } |

    for (@("PUBLIC_READ_PURSES", payload, return) <= entryCh) {
      match payload.size() < 101 {
        true => {
          iteratePropertiesCh!((payload, return))
        }
        _ => {
          @return!("error: payload must be a Set of strings with max size 100")
        }
      }
    } |

    for (@("PUBLIC_READ_PURSES_DATA", payload, return) <= entryCh) {
      match payload.size() < 101 {
        true => {
          iterateDataCh!((payload, return))
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


    for (@(amount, return) <= calculateFeeCh) {
      for (current <<- mainCh) {
        if (*current.get("fee") == Nil) {
          @return!((amount, 0))
        } else {
          match amount * *current.get("fee").nth(1) / 100000 {
            feeAmount => {
              @return!((amount - feeAmount, feeAmount))
            }
          }
        }
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
        { "quantity": Int, "purseId": String, "publicKey": String, "box": URI, "newId": Nil \\/ String, "data": _, "purseRevAddr": _, "purseAuthKey": _ } => {
          new getReturnCh, revVaultCh, ownerRevAddressCh, purseVaultCh, calculateFeeReturnCh, performRefundCh in {

            // refund if something went wrong
            for (@message <- performRefundCh) {
              new refundPurseBalanceCh, refundRevAddressCh, refundResultCh, refundPurseVaultCh, revVaultRefundReturnCh in {
                registryLookup!(\`rho:rchain:revVault\`, *revVaultRefundReturnCh) |
                for (@(_, RevVault) <- revVaultRefundReturnCh) {
                  @RevVault!("findOrCreate", payload.get("purseRevAddr"), *refundPurseVaultCh) |
                  for (@(true, purseVault) <- refundPurseVaultCh) {
                    @purseVault!("balance", *refundPurseBalanceCh) |
                    revAddress!("fromPublicKey", payload.get("publicKey").hexToBytes(), *refundRevAddressCh) |
                    for (@balance <- refundPurseBalanceCh; @buyerRevAddress <- refundRevAddressCh) {
                      @purseVault!("transfer", buyerRevAddress, balance, payload.get("purseAuthKey"), *refundResultCh) |
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
                }
              }
            } |

            @purses!("get", thm, payload.get("purseId"), *getReturnCh) |
            for (@properties <- getReturnCh) {
              match (
                properties.get("price"),
                properties.get("quantity") > 0,
                payload.get("quantity") > 0,
                properties.get("quantity") >= payload.get("quantity")
              ) {
                (Int, true, true, true) => {
                  registryLookup!(\`rho:rchain:revVault\`, *revVaultCh) |
                  revAddress!("fromPublicKey", properties.get("publicKey").hexToBytes(), *ownerRevAddressCh) |

                  calculateFeeCh!((payload.get("quantity") * properties.get("price"), *calculateFeeReturnCh)) |
                  for (@(_, RevVault) <- revVaultCh; @ownerRevAddress <- ownerRevAddressCh; amountAndFeeAmount <- calculateFeeReturnCh) {
                    match (
                      payload.get("purseRevAddr"),
                      ownerRevAddress,
                      *amountAndFeeAmount.nth(0),
                      *amountAndFeeAmount.nth(1)
                    ) {
                      (from, to, amount, feeAmount) => {
                        stdout!(("amount", amount)) |
                        stdout!(("feeAmount", feeAmount)) |
                        @RevVault!("findOrCreate", from, *purseVaultCh) |
                        for (@(true, purseVault) <- purseVaultCh) {
                          new makePurseReturnCh, transferReturnCh, setReturnCh, getForSaleReturnCh in {
                            // todo pay transfer fee
                            @purseVault!("transfer", to, amount, payload.get("purseAuthKey"), *transferReturnCh) |
                            for (@result <- transferReturnCh) {
                              match result {
                                (true, Nil) => {
                                  /*
                                    Check if the purse must be removed because quantity 0
                                    if fungible: false, we always match 0
                                    if match 0, simply send back the purse, it will probably
                                    be SWAPed by the buyer
                                  */
                                  match properties.get("quantity") - payload.get("quantity") {
                                    0 => {
                                      // todo remove key in treeHashMap instead of set Nil
                                      // not implemented in rnode yet
                                      @pursesForSale!("get", thm2, properties.get("id"), *getForSaleReturnCh) |
                                      for (purse <- getForSaleReturnCh) {
                                        if (*purse == Nil) {
                                          performRefundCh!("error: CRITICAL purse was not found in pursesForSale")
                                        } else {
                                          @return!((true, *purse))

                                        }
                                      }
                                    }
                                    _ => {
                                      // change quantity of exiting purse
                                      @purses!("set", thm, properties.get("id"),
                                        properties.set("quantity", properties.get("quantity") - payload.get("quantity"))
                                      , *setReturnCh) |
                                      // create a new purse
                                      for (_ <- setReturnCh) {
                                        makePurseCh!((
                                          properties
                                            .set("price", Nil)
                                            .set("newId", payload.get("newId"))
                                            .set("quantity", payload.get("quantity"))
                                            .set("publicKey", payload.get("publicKey"))
                                            .set("box", payload.get("box")),
                                          payload.get("data"),
                                          *makePurseReturnCh
                                        )) |
                                        for (newPurse <- makePurseReturnCh) {
                                          match *newPurse {
                                            String => {
                                              performRefundCh!("error: makePurse went wrong " ++ *newPurse)
                                            }
                                            _ => {
                                              @return!((true, *newPurse))
                                            }
                                          }
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
                _=> {
                  performRefundCh!("error: quantity not available or purse not for sale")
                }
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
      stdout!(*entryUri) |
      new boxDataCh, boxReturnCh in {
        @(*deployerId, "rho:id:${fromBoxRegistryUri}")!(({ "type": "READ" }, *boxDataCh)) |
        for (r <- boxDataCh) {
        stdout!(*r) |
          match (*r.get("version")) {
            "5.0.2" => {
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
                      // fee on each PUBLIC_PURCHASE operation
                      // .fee: Nil | tuple(publicKey: string, fee: Int)
                      // .fee is express NOT IN PERCENT but in PER 100.000
                      // example: 1000 = 1% fee, 200 = 0.2% etc.
                      "fee": ${payload.fee ? `("${payload.fee[0]}", ${payload.fee[1]})` : "Nil"},
                      "registryUri": *entryUri,
                      "locked": false,
                      "fungible": ${payload.fungible},
                      "version": "5.0.2"
                    }) |
                    stdout!({
                      "status": "completed",
                      "fee": ${payload.fee ? `("${payload.fee[0]}", ${payload.fee[1]})` : "Nil"},
                      "registryUri": *entryUri,
                      "locked": false,
                      "fungible": ${payload.fungible},
                      "version": "5.0.2"
                    }) |
                    stdout!("completed, contract deployed")
                  }
                }
              }
            }
            _ => {
              mainCh!({
                "status": "failed",
                "message": "box has not the same version number 5.0.2",
              }) |
              stdout!({
                "status": "failed",
                "message": "box has not the same version number 5.0.2",
              })
            }
          }
        }
      }

      /*OUTPUT_CHANNEL*/
    }
  }
}
`;
};
