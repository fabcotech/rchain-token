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
    the purse with SEND, SPLIT, SWAP, BURN "instance channels"
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
          _ => {
            for (ids <<- pursesIds) {
              match *ids.contains(properties.get("id")) {
                true => { @return!("error: purse ID already exists") }
                false => { idAndQuantityCh!({ "id": properties.get("id"), "quantity": 1 }) }
              }
            }
          }
        }
      } |
      for (idAndQuantity <- idAndQuantityCh) {
        match properties
          .set("id", *idAndQuantity.get("id"))
          .set("quantity", *idAndQuantity.get("quantity"))
        {
          purseProperties => {
            match purseProperties {
              {
                "quantity": Int,
                // not used in main contract or box contract
                // only useful for dumping data
                "publicKey": String,
                "type": String,
                "id": String
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
                        for (@(Nil, returnSwap) <= @(*purse, "SWAP")) {
                          for (id <- @(*vault, *purse)) {
                            for (ids <- pursesIds) {
                              pursesIds!(*ids.delete(*id))
                            } |
                            for (data <- @(*pursesData, *id)) {
                              for (props <- @(*purses, *id)) {
                                makePurseCh!((
                                  *props, *data, returnSwap
                                ))
                              }
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
                          SPLIT
                          (payload: Int) => string | (true, purse)
                        */
                        for (@(payload, returnSplit) <= @(*purse, "SPLIT")) {
                          match payload {
                            Int => {
                              new boxEntryCh, receivePursesReturnCh, readReturnCh, makePurseReturnCh in {
                                @(*purse, "READ")!((Nil, *readReturnCh)) |
                                for (@properties1 <- readReturnCh) {
                                  match (
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
                                          properties2.set("quantity", payload), Nil, *makePurseReturnCh
                                        )) |
                                        for (newPurse <- makePurseReturnCh) {
                                          @returnSplit!((true, *newPurse))
                                        }
                                      }
                                    }
                                    _ => {
                                      @returnSplit!("error: quantity invalid")
                                    }
                                  }
                                }
                              }

                            }
                            _ => {
                              @returnSplit!("error: payload must be an integer")
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
                        } |

                        /*
                          SEND
                          (boxRegistryUri: URI) => string | (true, Nil)
                        */
                        for (@(payload, returnSend) <= @(*purse, "SEND")) {
                          new boxEntryCh, receivePursesReturnCh, readReturnCh in {
                            @(*purse, "READ")!((Nil, *readReturnCh)) |
                            for (properties <- readReturnCh) {
                              registryLookup!(payload, *boxEntryCh) |
                              for (boxEntry <- boxEntryCh) {
                                for (current <<- mainCh) {
                                  @(*boxEntry, "PUBLIC_RECEIVE_PURSE")!((
                                    {
                                      "registryUri": *current.get("registryUri"),
                                      "purse": *purse,
                                      "fungible": *current.get("fungible"),
                                      "type": *properties.get("type")
                                    },
                                    *receivePursesReturnCh
                                  )) |
                                  for (r <- receivePursesReturnCh) {
                                    match *r {
                                      String => { @returnSend!(*r) }
                                      _ => {
                                        /*
                                          at this point *purse has been swapped/deposited,
                                          nothing in @(*vault, *purse), or pursesIds,
                                          *purse is worthless
                                        */
                                        @returnSend!((true, Nil))
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
                            @return!((true, { "fungible": current.get("fungible"), "purses": *createdPurses ++ [*purse] }))
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

  for (@(payload, return) <= @(*entryCh, "PUBLIC_READ_PURSES_IDS")) {
    for (ids <<- pursesIds) {
      @return!(*ids)
    }
  } |

  for (@(payload, return) <= @(*entryCh, "PUBLIC_READ_PURSES")) {
    match payload.size() < 100 {
      true => {
        iterateCh!((*purses, payload, return))
      }
      _ => {
        @return!("error: payload must be a Set of strings with max size 100")
      }
    }
  } |

  for (@(payload, return) <= @(*entryCh, "PUBLIC_READ_PURSES_DATA")) {
    match payload.size() < 100 {
      true => {
        iterateCh!((*pursesData, payload, return))
      }
      _ => {
        @return!("error: payload must be a Set of strings with max size 100")
      }
    }
  } |

  for (@(payload, return) <= @(*entryCh, "PUBLIC_READ")) {
    for (current <<- mainCh) {
      @return!(*current)
    }
  } |

  /*
    (purse[]) => String | (true, id[])
    receives a list of purse, check that (they exist + no duplicate)
    and returns the corresponding list of ids
  */
  for (@(payload, return) <= @(*entryCh, "PUBLIC_CHECK_PURSES")) {
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


  // ====================================
  // ===================== INITIALIZATION
  // save superKeyCh to a box
  // ====================================

  /*
    todo: secure with bundle- (*entryCh -> bundle-{*entryCh}) , but we must
    do it after all the listens are active
  */
  insertArbitrary!(*entryCh, *entryUriCh) |

  for (entryUri <- entryUriCh) {
    new boxDataCh, boxReturnCh in {
      @(*deployerId, "rho:id:${fromBoxRegistryUri}")!(({ "type": "READ" }, *boxDataCh)) |
      for (r <- boxDataCh) {
      stdout!(*r) |
        match (*r.get("version")) {
          "5.0.0" => {
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
                    "version": "5.0.0"
                  }) |
                  stdout!({
                    "status": "completed",
                    "registryUri": *entryUri,
                    "locked": false,
                    "fungible": ${payload.fungible},
                    "version": "5.0.0"
                  }) |
                  stdout!("completed, contract deployed")
                }
              }
            }
          }
          _ => {
            mainCh!({
              "status": "failed",
              "message": "box has not the same version number 5.0.0",
            }) |
            stdout!({
              "status": "failed",
              "message": "box has not the same version number 5.0.0",
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
