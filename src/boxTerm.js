
module.exports.boxTerm = () => {
  return `new 
  mainCh,
  entryCh,
  entryUriCh,
  returnBagsWithoutKeys,
  createKeyInBoxPurseIfNotExistCh,
  superKeysCh,
  boxPursesCh,
  deployerId(\`rho:rchain:deployerId\`),
  stdout(\`rho:io:stdout\`),
  insertArbitrary(\`rho:registry:insertArbitrary\`),
  lookup(\`rho:registry:lookup\`)
in {

  // superKeys
  // { [URI]: key }
  superKeysCh!({}) |

  // keys
  // { [URI]: { [bagId: string]: key } }
  boxPursesCh!({}) |

  // returns { [URI]: Set[BagId] }
  contract returnBagsWithoutKeys(@(registryUris, keys, return)) = {
    new tmpCh, itCh in {
      for (@(tmpCh, registryUris) <= itCh) {
        for (tmp <- @tmpCh) {
          match registryUris {
            Nil => {
              @return!(*tmp)
            }
            Set(last) => {
              @return!(*tmp.set(last, keys.get(last).keys()))
            }
            Set(first ... rest) => {
              @tmpCh!(*tmp.set(first, keys.get(first).keys())) |
              itCh!((tmpCh, rest))
            }
          }
        }
      } |
      tmpCh!({}) |
      itCh!((*tmpCh, registryUris))
    }
  } |

  for (@(uri, return) <= createKeyInBoxPurseIfNotExistCh) {
    match uri {
      URI => {
        for (keys <<- boxPursesCh) {
          match *keys.get(uri) {
            Nil => {
              for (_ <- boxPursesCh) {
                boxPursesCh!(*keys.set(uri, {})) | @return!({})
              }
            }
            _ => {
              @return!(*keys.get(uri))
            }
          }
        }
      }
      _ => {
        @return!("error: unknown type")
      }
    }
  } |

  // PUBLIC capabilities
  /*
    (payload: { registryUri: URI, purse: *purse }) => String | (true, Nil)
    Receives a purse, checks it, find a purse with same type
    if fungible
      SWAP
    if non-fungible
      if a purse in box is found (same type AND price Nil): DEPOSIT
      else: SWAP and save new purse
  */
  // todo, if this operation fails, remove empty key in boxPurses ?
  for (@(payload, return) <= @(*entryCh, "PUBLIC_RECEIVE_PURSE")) {
    new lookupReturnCh, checkReturnCh, readReturnCh, readPropertiesReturnCh, return1Ch,
    itCh, doDepositOrSwapCh in {

      /*
        1: check the purses received by asking
        the contract at payload.get("registryUri")
      */
      lookup!(payload.get("registryUri"), *lookupReturnCh) |
      for (contractEntry <- lookupReturnCh) {
        @(*contractEntry, "PUBLIC_CHECK_PURSES")!(([payload.get("purse")], *checkReturnCh)) |
        @(*contractEntry, "PUBLIC_READ")!((Nil, *readReturnCh)) |
        @(payload.get("purse"), "READ")!((Nil, *readPropertiesReturnCh)) |
        for (checkReturn <- checkReturnCh; current <- readReturnCh; receivedPurseProperties <- readPropertiesReturnCh) {
          stdout!(("PUBLIC_RECEIVE_PURSE 2", *checkReturn, *current, *receivedPurseProperties)) |
          match *checkReturn {
            String => {
              @return!(*checkReturn)
            }
            (true, _) => {
              /*
                2: create key for registry URI in boxPurses if it does
                nto exist
              */
              createKeyInBoxPurseIfNotExistCh!((payload.get("registryUri"), *return1Ch)) |

              for (@purses <- return1Ch) {
                match purses {
                  String => {
                    @return!(purses)
                  }
                  _ => {
                    match *current.get("fungible") {
                      false => {
                        doDepositOrSwapCh!((
                          payload.get("purse"),
                          payload.get("registryUri"),
                          "swap",
                          Nil
                        ))
                      }
                      true => {
                        /*
                          Must find a purse to deposit to with same .type, and .price Nil
                          if not found, then swap
                        */
                        new tmpCh, itCh in {
                          for (pursesIds <= itCh) {
                            match *pursesIds {
                              Set() => {
                                doDepositOrSwapCh!((
                                  payload.get("purse"),
                                  payload.get("registryUri"),
                                  "swap",
                                  Nil
                                ))
                              }
                              Set(last) => {
                                new readReturnCh in {
                                  @(purses.get(last), "READ")!((Nil, *readReturnCh)) |
                                  for (properties <- readReturnCh) {
                                    match (
                                      *properties.get("type") == *receivedPurseProperties.get("type"),
                                      *properties.get("price") == Nil
                                    ) {
                                      (true, true) => {
                                        doDepositOrSwapCh!((
                                          payload.get("purse"),
                                          payload.get("registryUri"),
                                          "deposit",
                                          purses.get(last)
                                        ))
                                      }
                                      _ => {
                                        doDepositOrSwapCh!((
                                          payload.get("purse"),
                                          payload.get("registryUri"),
                                          "swap",
                                          Nil
                                        ))
                                      }
                                    }
                                  }
                                }
                              }
                              Set(first ... rest) => {
                                new readReturnCh in {
                                  @(purses.get(first), "READ")!((Nil, *readReturnCh)) |
                                  for (properties <- readReturnCh) {
                                    match (
                                      *properties.get("type") == *receivedPurseProperties.get("type"),
                                      *properties.get("price") == Nil
                                    ) {
                                      (true, true) => {
                                        doDepositOrSwapCh!((
                                          payload.get("purse"),
                                          payload.get("registryUri"),
                                          "deposit",
                                          purses.get(first)
                                        ))
                                      }
                                      _ => {
                                        itCh!(rest)
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          } |
                          itCh!(purses.keys())
                        }
                      }
                    }
                  }
                }
              } |

              /*
                3: SWAP or DEPOSIT then save to boxPursesCh
              */
              for (@(purse, registryUri, operation, purseToDepositTo) <- doDepositOrSwapCh) {
                match operation {
                  "swap" => {
                    new returnSwapCh, returnPropertiesCh in {
                      @(purse, "SWAP")!((Nil, *returnSwapCh)) |
                      for (swappedPurse <- returnSwapCh) {
                        @(*swappedPurse, "READ")!((Nil, *returnPropertiesCh)) |
                        for (properties <- returnPropertiesCh) {
                          for (boxPurses <- boxPursesCh) {
                            boxPursesCh!(
                              *boxPurses.set(
                                registryUri,
                                *boxPurses.get(registryUri).set(
                                  *properties.get("id"),
                                  *swappedPurse
                                )
                              )
                            ) |
                            @return!((true, Nil))
                          }
                        }
                      }
                    }
                  }
                  "deposit" => {
                    new returnDepositCh, returnPropertiesCh in {
                      @(purseToDepositTo, "DEPOSIT")!((purse, *returnDepositCh)) |
                      for (r <- returnDepositCh) {
                        match *r {
                          String => {
                            @return!(*r)
                          }
                          (true, Nil) => {
                            @return!((true, Nil))
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

  for (@(Nil, return) <= @(*entryCh, "PUBLIC_READ")) {
    for (main <<- mainCh) {
      @return!(*main)
    }
  } |

  for (@(payload, return) <= @(*entryCh, "PUBLIC_READ_SUPER_KEYS")) {
    for (superKeys <<- superKeysCh) {
      @return!(*superKeys.keys())
    }
  } |

  for (@(payload, return) <= @(*entryCh, "PUBLIC_READ_PURSES")) {
    for (purses <<- boxPursesCh) {
      match *purses.keys().size() {
        0 => {
          @return!({})
        }
        _ => {
          returnBagsWithoutKeys!((*purses.keys(), *purses, return))
        }
      }
    }
  } |

  /*
    todo: secure with bundle- (*entryCh -> bundle-{*entryCh}) , but we must
    do it after all the listens are active
  */
  insertArbitrary!(*entryCh, *entryUriCh) |

  for (entryUri <- entryUriCh) {

    // OWNER / PRIVATE capabilities
    for (@(action, return) <= @(*deployerId, "\${n}" %% { "n": *entryUri })) {
      match action.get("type") {
        "READ" => {
          for (main <<- mainCh) {
            @return!(*main)
          }
        }
        "READ_SUPER_KEYS" => {
          for (superKeys <<- superKeysCh) {
            @return!(*superKeys)
          }
        }
        "READ_PURSES" => {
          for (purses <<- boxPursesCh) {
            @return!(*purses)
          }
        }
        "SAVE_PURSE_SEPARATELY" => {
          match (
            action.get("payload").get("registryUri"),
            action.get("payload").get("purse"),
          ) {
            (URI, _) => {
              new createKeyReturnCh, readReturnCh in {
                createKeyInBoxPurseIfNotExistCh!((action.get("payload").get("registryUri"), *createKeyReturnCh)) |
                for (purses <- createKeyReturnCh) {
                  match *purses {
                    String => {
                      @return!("error: invalid payload")
                    }
                    _ => {
                      @(action.get("payload").get("purse"), "READ")!((Nil, *readReturnCh)) |
                      for (@properties <- readReturnCh) {
                        for (boxPurses <- boxPursesCh) {
                          boxPursesCh!(
                            *boxPurses.set(
                              action.get("payload").get("registryUri"),
                              *purses.set(
                                properties.get("id"),
                                action.get("payload").get("purse")
                              )
                            )
                          ) |
                          @return!((true, Nil))
                        }
                      }
                    }
                  }
                }
              }
            }
            _ => {
              @return!("error: invalid payload")
            }
          }
        }
        "DELETE_PURSE" => {
          for (purses <<- boxPursesCh) {
            match action.get("payload") {
              payload => {
                match (
                  payload.get("registryUri"),
                  payload.get("id"),
                  *purses.get(payload.get("registryUri"))
                ) {
                  (URI, String, Map) => {
                    for (boxPurses <- boxPursesCh) {
                      boxPursesCh!(
                        *boxPurses.set(
                          payload.get("registryUri"),
                          *boxPurses.get(payload.get("registryUri")).delete(payload.get("id"))
                        )
                      ) |
                      @return!((true, Nil))
                    }
                  }
                  _ => {
                    @return!("error: invalid payload")
                  }
                }
              }
              _ => {
                @return!("error: invalid payload")
              }
            }
          }
        }
        "SAVE_SUPER_KEY" => {
          match action.get("payload") {
            { "superKey": _, "registryUri": URI } => {
              for (keys <- superKeysCh) {
                match *keys.keys().contains(action.get("payload").get("registryUri")) {
                  true => {
                    superKeysCh!(*keys) |
                    @return!("error: super key for registryUri already exists in box")
                  }
                  false => {
                    superKeysCh!(*keys.set(action.get("payload").get("registryUri"), action.get("payload").get("superKey"))) |
                    @return!((true, Nil))
                  }
                }
              }
            }
            _ => {
              @return!("error: invalid payload, structure should be { superKey: _, registryUri: String }")
            }
          }
        }
        _ => {
          @return!("error: unknown action")
        }
      }
    } |

    stdout!("box deployed, private channel is @(*deployerId, '\${n}')" %% { "n": *entryUri }  ) |
    mainCh!({
      "registryUri": *entryUri,
      "version": "5.0.0",
      "status": "completed"
    })
  }
}
`;
};
