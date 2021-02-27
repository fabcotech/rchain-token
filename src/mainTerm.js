module.exports.mainTerm = (fromBoxRegistryUri) => {
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
        // { "quantity": 100, "n": "GOLD", "publicKey": "aaa" }
      }
    }
  */
  vault,

  /*
    A purse's properties is a Map {"quantity", "n", "price", "publicKey"}
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
    decide which id to give to the new purse
    and make/instantiates the purse
  */
  for (@(purse, data, return) <= makePurseCh) {
    for (counter <- counterCh) {
      counterCh!(*counter + 1) |
      match purse.set("id", "\${n}" %% { "n": *counter }) {
        newPurse => {
          match newPurse {
            {
              "quantity": Int,
              // not used in main contract or box contract
              // only useful for dumping data
              "publicKey": String,
              "n": String,
              "id": String
            } => {
              for (ids <- pursesIds) {
                match *ids.contains(newPurse.get("id")) {
                  false => {
                    pursesIds!(*ids.union(Set(newPurse.get("id")))) |
                    @(*purses, newPurse.get("id"))!(newPurse) |
                    @(*pursesData, newPurse.get("id"))!(data) |
                    new purse in {
                      @(*vault, *purse)!(newPurse.get("id")) |
                      @return!(*purse) |

                      /*
                        READ
                        Returns prperties "id", "quantity", "n", "publicKey" and "price"(not implemented)
                        (Nil) => properties
                      */
                      for (@(Nil, returnRead) <= @(*purse, "READ")) {
                        for (id <<- @(*vault, *purse)) {
                          for (properties <<- @(*purses, *id)) {
                            @returnRead!(*properties.set("id", *id))
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
                          for (data <- @(*pursesData, *id)) { Nil } |
                          for (properties <- @(*purses, *id)) {
                            makePurseCh!((*properties, Nil, returnSwap))
                          }
                        }
                      } |

                      /*
                        SPLIT
                        (int[]) => string | (true, purse[])
                      */
                      for (@(payload, returnSplit) <= @(*purse, "SPLIT")) { Nil } |

                      /*
                        SEND
                        (boxRegistryUri: URI) => string | (true, Nil)
                      */
                      for (@(payload, returnSend) <= @(*purse, "SEND")) {
                        registryLookup!(payload, *entryCh) |
                        new receivePursesCh in {
                          for (entry <- entryCh) {
                            for (current <- mainCh) {
                              @(*entry, "RECEIVE_PURSES")!((
                                {
                                  "registryUri": *current.get("registryUri"),
                                  "purses": [*purse]
                                },
                                *receivePursesCh
                              )) |
                              for (r <- receivePursesCh) {
                                match *r {
                                  String => { @returnSend!(*r) }
                                  _ => {
                                    /*
                                      at this point *purse has been swapped,
                                      nothing in @(*vault, *purse), or pursesIds,
                                      it is worthless
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
  } |

  // SUPER / ADMIN / PRIVATE capabilities (if not locked)
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
    Returns values corresponding to ids
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


  // ANY USER / PUBLIC capabilities
  for (@(payload, return) <= @(*entryCh, "READ_PURSES_IDS")) {
    stdout!("READ_PURSES_IDS") |
    for (ids <<- pursesIds) {
      @return!(*ids)
    }
  } |

  for (@(payload, return) <= @(*entryCh, "READ_PURSES")) {
    stdout!("READ_PURSES") |
    match payload.size() < 100 {
      true => {
        iterateCh!((*purses, payload, return))
      }
      _ => {
        @return!("error: payload must be a Set of strings with max size 100")
      }
    }
  } |

  for (@(payload, return) <= @(*entryCh, "READ_PURSES_DATA")) {
    stdout!("READ_PURSES_DATA") |
    match payload.size() < 100 {
      true => {
        iterateCh!((*pursesData, payload, return))
      }
      _ => {
        @return!("error: payload must be a Set of strings with max size 100")
      }
    }
  } |

  for (@(payload, return) <= @(*entryCh, "READ")) {
    stdout!("READ") |
    for (current <<- mainCh) {
      @return!(*current)
    }
  } |

  /*
    (purse[]) => String | (true, id[])
    receives a list of purse, check that (they exist + no duplicate)
    and returns the corresponding list of ids
  */
  for (@(payload, return) <= @(*entryCh, "CHECK_PURSES")) {
    stdout!("CHECK_PURSES") |
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
    todo: secure with bundle- (*entryCh -> bundle-{*entryCh}) , but we must
    do it after all the listens are active
  */
  insertArbitrary!(*entryCh, *entryUriCh) |

  for (entryUri <- entryUriCh) {
    new boxDataCh, boxReturnCh in {
      @(*deployerId, "rho:id:${fromBoxRegistryUri}")!({ "type": "READ" }, *boxDataCh) |
      for (r <- boxDataCh) {
        match (*r.get("version")) {
          "5.0.0" => {
            @(*deployerId, "rho:id:${fromBoxRegistryUri}")!(
              {
                "type": "SAVE_SUPER_KEY",
                "payload": { "superKey": *superKeyCh, "registryUri": *entryUri }
              },
              *boxReturnCh
            ) |
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
                    "version": "5.0.0"
                  }) |
                  stdout!({
                    "status": "completed",
                    "registryUri": *entryUri,
                    "locked": false,
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
