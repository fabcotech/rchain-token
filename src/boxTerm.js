
module.exports.boxTerm = () => {
  return `new 
  mainCh,
  entryCh,
  entryUriCh,
  returnBagsWithoutKeys,
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

  // PUBLIC capabilities
  for (@(payload, return) <= @(*entryCh, "RECEIVE_PURSES")) {
    new itCh, it2Ch, tmpKeysCh, checkPursesBeforeSwapCh in {
      /*
        1: validate payload and check/createregistry URI
      */
      for (keys <<- boxPursesCh) {
        match (payload.get("registryUri"), *keys.get(payload.get("registryUri"))) {
          (URI, Nil) => {
            for (_ <- boxPursesCh) {
              boxPursesCh!(
                *keys.set(
                  payload.get("registryUri"),
                  {}
                )
              ) |
              checkPursesBeforeSwapCh!((
                payload.get("purses"),
                payload.get("registryUri")
              ))
            }
          }
          (URI, _) => {
            checkPursesBeforeSwapCh!((
              payload.get("purses"),
              payload.get("registryUri")
            ))
          }
          _ => {
            @return!("error: could not match payload")
          }
        }
      } |
      tmpKeysCh!([]) |
      /*
        2: check keys and then swap
        This way we are sure they correspond to
        real keys in the contract
        then save to boxPursesCh
      */
      for (@(purses, registryUri) <- checkPursesBeforeSwapCh) {
        new lookupReturnCh, swapReturnCh in {
          lookup!(registryUri, *lookupReturnCh) |
          for (entry <- lookupReturnCh) {
            @(*entry, "CHECK_PURSES")!((purses, *swapReturnCh)) |
            for (r <- swapReturnCh) {
              match *r {
                String => {
                  @return!(*r)
                }
                (true, payload) => {
                  it2Ch!(purses) |
                  for (pursesForSwap <= it2Ch) {
                    match *pursesForSwap {
                      Nil => {
                        @return!("error: first element in purses list is Nil")
                      }
                      [last] => {
                        new returnSwapCh, returnPropertiesCh in {
                          @(last, "SWAP")!((Nil, *returnSwapCh)) |
                          for (purse <- returnSwapCh) {
                            @(*purse, "READ")!((Nil, *returnPropertiesCh)) |
                            for (properties <- returnPropertiesCh) {
                              for (boxPurses <- boxPursesCh) {
                                boxPursesCh!(
                                  *boxPurses.set(
                                    registryUri,
                                    *boxPurses.get(registryUri).set(
                                      *properties.get("id"),
                                      *purse
                                    )
                                  )
                                ) |
                                @return!((true, Nil))
                              }
                            }
                          }
                        }
                      }
                      [first ... rest] => {
                        new returnSwapCh, returnPropertiesCh in {
                          @(first, "SWAP")!((Nil, *returnSwapCh)) |
                          for (purse <- returnSwapCh) {
                            @(*purse, "READ")!((Nil, *returnPropertiesCh)) |
                            for (properties <- returnPropertiesCh) {
                              for (boxPurses <- boxPursesCh) {
                                boxPursesCh!(
                                  *boxPurses.set(
                                    registryUri,
                                    *boxPurses.get(registryUri).set(
                                      *properties.get("id"),
                                      *purse
                                    )
                                  )
                                ) |
                                it2Ch!(rest)
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

  for (@(Nil, return) <= @(*entryCh, "READ")) {
    for (main <<- mainCh) {
      @return!(*main)
    }
  } |

  for (@(payload, return) <= @(*entryCh, "READ_SUPER_KEYS")) {
    for (superKeys <<- superKeysCh) {
      @return!(*superKeys.keys())
    }
  } |

  for (@(payload, return) <= @(*entryCh, "READ_PURSES")) {
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
  for (action, return <= @(*deployerId, "\${n}" %% { "n": *entryUri })) {
    match *action.get("type") {
      "READ" => {
        for (main <<- mainCh) {
          return!(*main)
        }
      }
      "READ_SUPER_KEYS" => {
        for (superKeys <<- superKeysCh) {
          return!(*superKeys)
        }
      }
      "READ_PURSES" => {
        for (purses <<- boxPursesCh) {
          return!(*purses)
        }
      }
      "DELETE_PURSE" => {
        for (purses <<- boxPursesCh) {
          match *action.get("payload") {
            payload => {
              match (
                payload.get("registryUri"),
                payload.get("id"),
                *purses.get(payload.get("registryUri"))
              ) {
                (URI, String, Map) => {
                  for (purses <- boxPursesCh) {
                    boxPursesCh!(
                      *purses.set(
                        payload.get("registryUri"),
                        *purses.get(payload.get("registryUri")).delete(payload.get("id"))
                      )
                    ) |
                    return!((true, Nil))
                  }
                }
                _ => {
                  return!("error: invalid payload")
                }
              }
            }
            _ => {
              return!("error: invalid payload")
            }
          }
        }
      }
      "SAVE_SUPER_KEY" => {
        match *action.get("payload") {
          { "superKey": _, "registryUri": URI } => {
            for (keys <- superKeysCh) {
              match *keys.keys().contains(*action.get("payload").get("registryUri")) {
                true => {
                  superKeysCh!(*keys) |
                  return!("error: super key for registryUri already exists in box")
                }
                false => {
                  stdout!(*keys.set(*action.get("payload").get("registryUri"), *action.get("payload").get("superKey"))) |
                  stdout!(*keys) |
                  superKeysCh!(*keys.set(*action.get("payload").get("registryUri"), *action.get("payload").get("superKey"))) |
                  return!((true, Nil))
                }
              }
            }
          }
          _ => {
            return!("error: invalid payload, structure should be { superKey: _, registryUri: String }")
          }
        }
      }
      _ => {
        return!("error: unknown action")
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
