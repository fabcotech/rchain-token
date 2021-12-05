/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.masterTerm = (payload) => {
    return `new 
  basket,

  prefixCh,
  entryCh,
  entryUriCh,

  makePurseCh,
  transferToEscrowPurseCh,
  calculateFeeCh,
  validateStringCh,
  initializeOCAPOnBoxCh,

  initLocksForContractCh,
  initLocksForBoxCh,
  appendLogsForContract,

  /*
    vault is the ultimate accessibility unforgeable in
    master contract, every data is stored in channels that
    derives from *vault unforgeable name

    // tree hash map of purses :
    thm <- @(*vault, "purses", "contract03")

    // tree hash map of purses data :
    thm <- @(*vault, "pursesData", "contract03")

    // contract's configs
    config <- @(*vault, "contractConfig", "contract03")

    // box's configs
    config <- @(*vault, "boxConfig", "box01")

    // boxes (rholang Map)
    box <- @(*vault, "boxes", "box01")

    // super keys of a given box
    superKeys <- @(*vault, "boxesSuperKeys", "box01")
  */
  vault,

  /*
    boxesThm and contractsThm only store the list
    of existing contracts / boxes, ex:
    boxesThm:
    { "box1": "exists", "mycoolbox": "exists" }

    Then each box is a Map stored at a unique channel
    (see above) and has the following structure:
    {
      [contractId: string]: Set(purseId: string)
    }

    Each contract has its own tree hash map, and
    have the following structure:
    pursesThm, example of FT purses:
    {
      "1": { quantity: 2, timestamp: 12562173658, boxId: "box1", price: Nil},
      "2": { quantity: 12, timestamp: 12562173658, boxId: "box1", price: 2},
    }
  */
  boxesReadyCh,
  contractsReadyCh,

  TreeHashMap,

  savePurseInBoxCh,
  removePurseInBoxCh,
  getBoxCh,
  getPurseCh,
  getContractPursesThmCh,
  getContractPursesDataThmCh,

  insertArbitrary(\`rho:registry:insertArbitrary\`),
  stdout(\`rho:io:stdout\`),
  revAddress(\`rho:rev:address\`),
  registryLookup(\`rho:registry:lookup\`),
  blockData(\`rho:block:data\`)
in {

  // reimplementation of TreeHashMap

/*
  Communications between channels have generally been reduced to reduce amount of
  serialization / deserialization

  when you "init" you can choose that the processes are also stored as bytes, instead of storing a map for each node, it stores a map at channel @map, and bytes at channel @(map, "bytes), this will make the "getAllValues" 10x, 20x, 30x faster depending on the process you are storing

  !!! make sure your processes do not contain the string "£$£$", or the bytes c2a324c2a324, those are used as delimiters
*/

new MakeNode, ByteArrayToNybbleList, TreeHashMapSetter, TreeHashMapGetter, TreeHashMapUpdater, HowManyPrefixes, NybbleListForI, RemoveBytesSectionIfExistsCh, keccak256Hash(\`rho:crypto:keccak256Hash\`), powersCh, storeToken, nodeGet in {
  match ([1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,655256], ["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"], 12) {
    (powers, hexas, base) => {
      contract MakeNode(@initVal, @node) = {
        @[node, *storeToken]!(initVal)
      } |

      contract nodeGet(@node, ret) = {
        for (@val <<- @[node, *storeToken]) {
          ret!(val)
        }
      } |

      contract HowManyPrefixes(@map, ret) = {
        for (@depth <<- @(map, "depth")) {
          match depth {
            1 => ret!(base)
            2 => ret!(base * base)
            3 => ret!(base * base * base)
            4 => ret!(base * base * base * base)
          }
        }
      } |

      contract NybbleListForI(@map, @i, @depth, ret) = {
        match depth {
          1 => {
            match hexas.nth(i % base) {
              str => {
                ByteArrayToNybbleList!(str.hexToBytes(), 0, depth, [], *ret)
              }
            }
          }
          2 => {
            match hexas.nth(i / base) ++ hexas.nth(i % base) {
              str => {
                ByteArrayToNybbleList!(str.hexToBytes(), 0, depth, [], *ret)
              }
            }
          }
          3 => {
            match hexas.nth(i / base / base) ++ hexas.nth(i / base) ++ hexas.nth(i % base) {
              str => {
                ByteArrayToNybbleList!(str.hexToBytes(), 0, depth, [], *ret)
              }
            }
          }
          4 => {
            match hexas.nth(i / base / base / base) ++ hexas.nth(i / base / base) ++ hexas.nth(i / base) ++ hexas.nth(i % base) {
              str => {
                ByteArrayToNybbleList!(str.hexToBytes(), 0, depth, [], *ret)
              }
            }
          }
        }
      } |

      contract ByteArrayToNybbleList(@ba, @n, @len, @acc, ret) = {
        if (n == len) {
          ret!(acc)
        } else {
          ByteArrayToNybbleList!(ba, n+1, len, acc ++ [ ba.nth(n) % base ], *ret)
        }
      } |

      contract TreeHashMap(@"init", @depth, @alsoStoreAsBytes, ret) = {
        new map in {
          MakeNode!(0, (*map, [])) |
          if (alsoStoreAsBytes == true) {
            MakeNode!(0, ((*map, "bytes"), []))
          } |
          @(*map, "depth")!!(depth) |
          @(*map, "alsoStoreAsBytes")!!(alsoStoreAsBytes) |
          ret!(*map)
        }
      } |

      contract TreeHashMapGetter(@map, @nybList, @n, @len, @suffix, ret) = {
        // Look up the value of the node at (map, nybList.slice(0, n + 1))
        for (@val <<- @[(map, nybList.slice(0, n)), *storeToken]) {
          if (n == len) {
            ret!(val.get(suffix))
          } else {
            // Otherwise check if the rest of the path exists.
            // Bit k set means node k exists.
            // nybList.nth(n) is the node number
            // val & powers.nth(nybList.nth(n)) is nonzero if the node exists
            // (val / powers.nth(nybList.nth(n))) % 2 is 1 if the node exists
            if ((val / powers.nth(nybList.nth(n))) % 2 == 0) {
              ret!(Nil)
            } else {
              TreeHashMapGetter!(map, nybList, n + 1, len, suffix, *ret)
            }
          }
        }
      } |

      contract TreeHashMap(@"get", @map, @key, ret) = {
        new hashCh, nybListCh in {
          // Hash the key to get a 256-bit array
          keccak256Hash!(key.toByteArray(), *hashCh) |
          for (@hash <- hashCh) {
            for (@depth <<- @(map, "depth")) {
              // Get the bit list
              ByteArrayToNybbleList!(hash, 0, depth, [], *nybListCh) |
              for (@nybList <- nybListCh) {
                TreeHashMapGetter!(map, nybList, 0,  depth, hash.slice(depth, 32), *ret)
              }
            }
          }
        }
      } |
  
      // not used anymore, now getValuesAtIndex is used to get all values
      // this way we avoid iteration
      contract TreeHashMap(@"getAllValues", @map, ret) = {
        new howManyPrefixesCh, iterateOnPrefixesCh, nybListCh in {
          HowManyPrefixes!(map, *howManyPrefixesCh) |
          for (@depth <<- @(map, "depth")) {
            for (@alsoStoreAsBytes <<- @(map, "alsoStoreAsBytes")) {
              for (@howManyPrefixes <- howManyPrefixesCh ) {
                contract iterateOnPrefixesCh() = {
                  new itCh, bytesOrMapCh, TreeHashMapGetterValues in {
                    // do not move it up, the goal is reduce the number of serializatin / dezerialization
                    contract TreeHashMapGetterValues(@channel, @nybList, @n, @len, @i) = {
                      // channel is either map or (map, "bytes")
                      // Look up the value of the node at (channel, nybList.slice(0, n + 1))
                      for (@val <<- @[(channel, nybList.slice(0, n)), *storeToken]) {
                        if (n == len) {
                          if (val == Nil) {
                            itCh!(i + 1)
                          } else {
                            if (alsoStoreAsBytes == true) {
                              for (@bytes <- bytesOrMapCh) {
                                itCh!(i + 1) |
                                // store-as-bytes-map
                                bytesOrMapCh!(bytes.union(val))
                                // store-as-bytes-array
                                /* if (bytes == Nil) {
                                  bytesOrMapCh!(bytes)
                                } else {
                                  bytesOrMapCh!(bytes ++ val)
                                } */
                              }
                            } else {
                              for (@map <- bytesOrMapCh) {
                                bytesOrMapCh!(map.union(val)) |
                                itCh!(i + 1)
                              }
                            }
                          }
                        } else {
                          // Otherwise check if the rest of the path exists.
                          // Bit k set means node k exists.
                          // nybList.nth(n) is the node number
                          // val & powers.nth(nybList.nth(n)) is nonzero if the node exists
                          // (val / powers.nth(nybList.nth(n))) % 2 is 1 if the node exists
                          if ((val / powers.nth(nybList.nth(n))) % 2 == 0) {
                            itCh!(i + 1)
                          } else {
                            TreeHashMapGetterValues!(channel, nybList, n + 1, len, i)
                          }
                        }
                      }
                    } |

                    for (@i <= itCh) {
                      match i <= howManyPrefixes - 1 {
                        false => {
                          for (@a <- bytesOrMapCh) {
                            ret!(a)
                          }
                        }
                        true => {
                          NybbleListForI!(map, i, depth, *nybListCh) |
                          for (@nybList <- nybListCh) {
                            if (alsoStoreAsBytes == true) {
                              TreeHashMapGetterValues!((map, "bytes"), nybList, 0, depth, i)
                            } else {
                              TreeHashMapGetterValues!(map, nybList, 0, depth, i)
                            }
                          }
                        }
                      }
                    } |
                    if (alsoStoreAsBytes == true) {
                      // store-as-bytes-map
                       bytesOrMapCh!({})
                      // store-as-bytes-array
                      /* bytesOrMapCh!(Nil) */
                    } else {
                      bytesOrMapCh!({})
                    } |
                    itCh!(0)
                  }
                } |

                iterateOnPrefixesCh!()
              }
            }
          }
        }
      } |

      contract TreeHashMap(@"getValuesAtIndex", @map, @i, ret) = {
        new howManyPrefixesCh, nybListCh in {
          HowManyPrefixes!(map, *howManyPrefixesCh) |
          for (@depth <<- @(map, "depth")) {
            for (@alsoStoreAsBytes <<- @(map, "alsoStoreAsBytes")) {
              for (@howManyPrefixes <- howManyPrefixesCh ) {
                new TreeHashMapGetterValues in {
                  // do not move it up, the goal is reduce the number of serializatin / dezerialization
                  contract TreeHashMapGetterValues(@channel, @nybList, @n, @len, @i) = {
                    // channel is either map or (map, "bytes")
                    // Look up the value of the node at (channel, nybList.slice(0, n + 1))
                    for (@val <<- @[(channel, nybList.slice(0, n)), *storeToken]) {
                      if (n == len) {
                        ret!(val)
                      } else {
                        // Otherwise check if the rest of the path exists.
                        // Bit k set means node k exists.
                        // nybList.nth(n) is the node number
                        // val & powers.nth(nybList.nth(n)) is nonzero if the node exists
                        // (val / powers.nth(nybList.nth(n))) % 2 is 1 if the node exists
                        if ((val / powers.nth(nybList.nth(n))) % 2 == 0) {
                          ret!({})
                        } else {
                          TreeHashMapGetterValues!(channel, nybList, n + 1, len, i)
                        }
                      }
                    }
                  } |

                  NybbleListForI!(map, i, depth, *nybListCh) |
                  for (@nybList <- nybListCh) {
                    if (alsoStoreAsBytes == true) {
                      TreeHashMapGetterValues!((map, "bytes"), nybList, 0, depth, i)
                    } else {
                      TreeHashMapGetterValues!(map, nybList, 0, depth, i)
                    }
                  }
                }
              }
            }
          }
        }
      } |

      contract TreeHashMapSetter(@channel, @nybList, @n, @len, @newVal, @suffix, ret) = {
        // channel is either map or (map, "bytes")
        // Look up the value of the node at (channel, nybList.slice(0, n + 1))
        new valCh, restCh in {
          match (channel, nybList.slice(0, n)) {
            node => {
              for (@val <<- @[node, *storeToken]) {
                if (n == len) {
                  // Acquire the lock on this node
                  for (@val <- @[node, *storeToken]) {
                    // If we're at the end of the path, set the node to newVal.
                    if (val == 0) {
                      // Release the lock
                      @[node, *storeToken]!({suffix: newVal}) |
                      // Return
                      ret!(Nil)
                    }
                    else {
                      // Release the lock
                      if (newVal == Nil) {
                        @[node, *storeToken]!(val.delete(suffix)) |
                        // Return
                        ret!(Nil)
                      } else {
                        @[node, *storeToken]!(val.set(suffix, newVal)) |
                        // Return
                        ret!(Nil)
                      }
                    }
                  }
                } else {
                  // Otherwise make the rest of the path exist.
                  // Bit k set means child node k exists.
                  if ((val/powers.nth(nybList.nth(n))) % 2 == 0) {
                    // Child node missing
                    // Acquire the lock
                    for (@val <- @[node, *storeToken]) {
                      // Re-test value
                      if ((val/powers.nth(nybList.nth(n))) % 2 == 0) {
                        // Child node still missing
                        // Create node, set node to 0
                        MakeNode!(0, (channel, nybList.slice(0, n + 1))) |
                        // Update current node to val | (1 << nybList.nth(n))
                        match nybList.nth(n) {
                          bit => {
                            // val | (1 << bit)
                            // Bitwise operators would be really nice to have!
                            // Release the lock
                            @[node, *storeToken]!((val % powers.nth(bit)) +
                              (val / powers.nth(bit + 1)) * powers.nth(bit + 1) +
                              powers.nth(bit))
                          }
                        } |
                        // Child node now exists, loop
                        TreeHashMapSetter!(channel, nybList, n + 1, len, newVal, suffix, *ret)
                      } else {
                        // Child node created between reads
                        // Release lock
                        @[node, *storeToken]!(val) |
                        // Loop
                        TreeHashMapSetter!(channel, nybList, n + 1, len, newVal, suffix, *ret)
                      }
                    }
                  } else {
                    // Child node exists, loop
                    TreeHashMapSetter!(channel, nybList, n + 1, len, newVal, suffix, *ret)
                  }
                }
              }
            }
          }
        }
      } |

      contract TreeHashMap(@"set", @map, @key, @newVal, ret) = {
        new hashCh, nybListCh in {
          // Hash the key to get a 256-bit array
          keccak256Hash!(key.toByteArray(), *hashCh) |
          for (@hash <- hashCh) {
            for (@depth <<- @(map, "depth")) {
              for (@alsoStoreAsBytes <<- @(map, "alsoStoreAsBytes")) {
                ByteArrayToNybbleList!(hash, 0, depth, [], *nybListCh) |
                // Get the bit list
                for (@nybList <- nybListCh) {
                  if (alsoStoreAsBytes == true) {
                    new ret1, ret2 in {
                      if (newVal == Nil) {
                        TreeHashMapSetter!((map, "bytes"), nybList, 0,  depth, Nil, hash.slice(depth, 32), *ret2)
                      } else {
                        TreeHashMapSetter!((map, "bytes"), nybList, 0,  depth, newVal.toByteArray(), hash.slice(depth, 32), *ret2)
                      } |
                      TreeHashMapSetter!(map, nybList, 0, depth, newVal, hash.slice(depth, 32), *ret1) |
                      for (_ <- ret1; _ <- ret2) {
                        ret!(Nil)
                      }
                    }
                  } else {
                    TreeHashMapSetter!(map, nybList, 0,  depth, newVal, hash.slice(depth, 32), *ret)
                  }
                }
              }
            }
          }
        }
      } |

      contract TreeHashMapUpdater(@map, @nybList, @n, @len, update, @suffix, ret) = {
        // Look up the value of the node at [map, nybList.slice(0, n + 1)
        new valCh in {
          match (map, nybList.slice(0, n)) {
            node => {
              for (@val <<- @[node, *storeToken]) {
                if (n == len) {
                  // We're at the end of the path.
                  if (val == 0) {
                    // There's nothing here.
                    // Return
                    ret!(Nil)
                  } else {
                    new resultCh in {
                      // Acquire the lock on this node
                      for (@val <- @[node, *storeToken]) {
                        // Update the current value
                        update!(val.get(suffix), *resultCh) |
                        for (@newVal <- resultCh) {
                          // Release the lock
                          if (newVal == Nil) {
                            @[node, *storeToken]!(val.delete(suffix)) |
                            // Return
                            ret!(Nil)
                          } else {
                            @[node, *storeToken]!(val.set(suffix, newVal)) |
                            // Return
                            ret!(Nil)
                          }
                        }
                      }
                    }
                  }
                } else {
                  // Otherwise try to reach the end of the path.
                  // Bit k set means child node k exists.
                  if ((val/powers.nth(nybList.nth(n))) % 2 == 0) {
                    // If the path doesn't exist, there's no value to update.
                    // Return
                    ret!(Nil)
                  } else {
                    // Child node exists, loop
                    TreeHashMapUpdater!(map, nybList, n + 1, len, *update, suffix, *ret)
                  }
                }
              }
            }
          }
        }
      } |

      contract TreeHashMap(@"update", @map, @key, update, ret) = {
        new hashCh, nybListCh, keccak256Hash(\`rho:crypto:keccak256Hash\`) in {
          // Hash the key to get a 256-bit array
          keccak256Hash!(key.toByteArray(), *hashCh) |
          for (@hash <- hashCh) {
            for (@depth <<- @(map, "depth")) {
              for (@alsoStoreAsBytes <<- @(map, "alsoStoreAsBytes")) {
                // Get the bit list
                ByteArrayToNybbleList!(hash, 0, depth, [], *nybListCh) |
                for (@nybList <- nybListCh) {
                  if (alsoStoreAsBytes == true) {
                    new ret1, ret2, updateWrapper, retWrapper, updateWrapperBytes in {
                      for (@val, ret <- updateWrapper; _, retBytes <- updateWrapperBytes) {
                          update!(val, *retWrapper) |
                          for (@newVal <- retWrapper) {
                            ret!(newVal) |
                            retBytes!(newVal.toByteArray())
                          }
                      } |
                      TreeHashMapUpdater!((map, "bytes"), nybList, 0, depth, *updateWrapperBytes, hash.slice(depth, 32), *ret1) |
                      TreeHashMapUpdater!(map, nybList, 0, depth, *updateWrapper, hash.slice(depth, 32), *ret2) |
                      for (_ <- ret1; _ <- ret2) {
                        ret!(Nil)
                      }
                    }
                  } else {
                    TreeHashMapUpdater!(map, nybList, 0, depth, *update, hash.slice(depth, 32), *ret)
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

  // depth 1 = 12 maps in tree hash map
  // depth 2 = 12 * 12 = 144 maps in tree hash map
  // etc...

  // WITHDRAW, PURCHASE and CREATE_PURSE can touch the same boxes or
  // purses, we cannot allow concurrency because we want to avoid
  // race conditions

  for (@boxId <= initLocksForBoxCh) {
    @(*vault, "RENEW_LOCK", boxId)!(Nil) |
    @(*vault, "UPDATE_PURSE_PRICE_LOCK", boxId)!(Nil) |
    @(*vault, "UPDATE_PURSE_DATA_LOCK", boxId)!(Nil) |
    @(*vault, "REGISTER_CONTRACT_LOCK", boxId)!(Nil)
  } |

  for (@contractId <= initLocksForContractCh) {
    @(*vault, "CONTRACT_LOCK", contractId)!(Nil)
  } |

  // validate string, used for purse ID, box ID, contract ID
  for (@(str, ret) <= validateStringCh) {
    match (str, Set("a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9")) {
      (String, valids) => {
        new tmpCh, itCh in {
          for (@i <= itCh) {
            if (i == str.length()) { @ret!(true) }
            else {
              if (valids.contains(str.slice(i, i + 1)) == true) { itCh!(i + 1) }
              else { @ret!(false) }
            }
          } |
          itCh!(0)
        }
      }
      _ => { @ret!(false) }
    }
  } |

  for (@(contractId, type, str) <= appendLogsForContract) {
    new blockDataCh in {
      blockData!(*blockDataCh) |
      for (_, @timestamp, _ <- blockDataCh) {
        for (@current <- @(*vault, "LOGS", contractId)) {
          stdout!(current.length()) |
          match current.length() > 2600 {
            true => {
              @(*vault, "LOGS", contractId)!("\${type},\${ts}," %% { "type": type, "ts": timestamp } ++ str ++ current.slice(0,2200))
            }
            false => {
              @(*vault, "LOGS", contractId)!("\${type},\${ts}," %% { "type": type, "ts": timestamp } ++ str ++ current)
            }
          }
        }
      }
    }
  } |

  TreeHashMap!("init", ${payload.depth || 3}, true, *boxesReadyCh) |
  TreeHashMap!("init", ${payload.depth || 3}, false, *contractsReadyCh) |

  for (@boxesThm <- boxesReadyCh; @contractsThm <- contractsReadyCh) {

    // returns the box if exists
    for (@(boxId, return) <= getBoxCh) {
      new ch1 in {
        TreeHashMap!("get", boxesThm, boxId, *ch1) |
        for (@exists <- ch1) {
          if (exists == "exists") {
            for (@box <<- @(*vault, "boxes", boxId)) {
              @return!(box)
            }
          } else {
            @return!(Nil)
          }
        }
      }
    } |

    // returns the purse if exists AND is associated with box
    for (@(box, contractId, purseId, return) <= getPurseCh) {
      new ch1 in {
        if (box.get(contractId) == Nil) {
          @return!(Nil)
        } else {
          if (box.get(contractId).contains(purseId) == true) {
            getContractPursesThmCh!((contractId, *ch1)) |
            for (@pursesThm <- ch1) {
              TreeHashMap!("get", pursesThm, purseId, return)
            }
          } else {
            @return!(Nil)
          }
        }
      }
    } |

    // returns the tree hash map of the contract's purses if exists
    for (@(contractId, return) <= getContractPursesThmCh) {
      new ch1 in {
        TreeHashMap!("get", contractsThm, contractId, *ch1) |
        for (@exists <- ch1) {
          if (exists == "exists") {
            for (@pursesThm <<- @(*vault, "purses", contractId)) {
              @return!(pursesThm)
            }
          } else {
            @return!(Nil)
          }
        }
      }
    } |

    // returns the tree hash map of the contract's purses data if exists
    for (@(contractId, return) <= getContractPursesDataThmCh) {
      new ch1 in {
        TreeHashMap!("get", contractsThm, contractId, *ch1) |
        for (@exists <- ch1) {
          if (exists == "exists") {
            for (@pursesDataThm <<- @(*vault, "pursesData", contractId)) {
              @return!(pursesDataThm)
            }
          } else {
            @return!(Nil)
          }
        }
      }
    } |
  
    // remove purse in box, if found
    for (@(boxId, contractId, purseId, return) <= removePurseInBoxCh) {
      for (@box <- @(*vault, "boxes", boxId)) {
        if (box.get(contractId) == Nil) {
          @return!("error: CRITICAL contract id not found in box") |
          @(*vault, "boxes", boxId)!(box)
        } else {
          if (box.get(contractId).contains(purseId) == false) {
            @return!("error: CRITICAL purse does not exists in box") |
            @(*vault, "boxes", boxId)!(box)
          } else {
            stdout!(contractId ++ "/" ++ boxId ++ " purse " ++ purseId ++ " removed from box") |
            @(*vault, "boxes", boxId)!(box.set(contractId, box.get(contractId).delete(purseId))) |
            @return!((true, Nil))
          }
        }
      }
    } |

    // save purse id in box
    for (@(contractId, purse, merge, return) <= savePurseInBoxCh) {
      new ch1, ch3, iterateAndMergePursesCh in {

        for (@box <- @(*vault, "boxes", purse.get("boxId"))) {
          getContractPursesThmCh!((contractId, *ch1)) |
          for (@pursesThm <- ch1) {
            if (pursesThm != Nil) {
              if (box.get(contractId) == Nil) {
                stdout!(contractId ++ "/" ++ purse.get("boxId") ++ " purse " ++ purse.get("id") ++ " saved to box") |
                @(*vault, "boxes", purse.get("boxId"))!(box.set(contractId, Set(purse.get("id")))) |
                @return!((true, purse))
              } else {
                if (box.get(contractId).contains(purse.get("id")) == false) {
                  for (@contractConfig <<- @(*vault, "contractConfig", contractId)) {
                    match (contractConfig.get("fungible") == true, merge) {
                      (true, true) => {
                        for (@pursesThm <<- @(*vault, "purses", contractId)) {
                          TreeHashMap!("get", pursesThm, purse.get("id"), *ch3) |
                          for (@purse <- ch3) {
                            iterateAndMergePursesCh!((box, pursesThm))
                          }
                        }
                      }
                      _ => {
                        stdout!(contractId ++ "/" ++ purse.get("boxId") ++ " purse " ++ purse.get("id") ++ " saved to box") |
                        @(*vault, "boxes", purse.get("boxId"))!(box.set(
                          contractId,
                          box.get(contractId).union(Set(purse.get("id")))
                        )) |
                        @return!((true, purse))
                      }
                    }
                  }
                } else {
                  @(*vault, "boxes", purse.get("boxId"))!(box) |
                  @return!("error: CRITICAL, purse already exists in box")
                }
              }
            } else {
              @(*vault, "boxes", purse.get("boxId"))!(box) |
              @return!("error: CRITICAL, pursesThm not found")
            }
          }
        } |

        // if contract is fungible, we may find a
        // purse with same .price property
        // if found, then merge and delete current purse
        for (@(box, pursesThm) <- iterateAndMergePursesCh) {
          new tmpCh, itCh in {
            for (ids <= itCh) {
              match *ids {
                Set() => {
                  stdout!(contractId ++ "/" ++ purse.get("boxId") ++ " purse " ++ purse.get("id") ++ " saved to box") |
                  @(*vault, "boxes", purse.get("boxId"))!(box.set(contractId, Set(purse.get("id")))) |
                  @return!((true, purse))
                }
                Set(last) => {
                  new ch4, ch5, ch6, ch7 in {
                    TreeHashMap!("get", pursesThm, last, *ch4) |
                    for (@purse2 <- ch4) {
                      match purse2.get("price") == purse.get("price") {
                        true => {
                          TreeHashMap!(
                            "set",
                            pursesThm,
                            last,
                            purse2.set("quantity", purse2.get("quantity") + purse.get("quantity")),
                            *ch5
                          ) |
                          TreeHashMap!(
                            "set",
                            pursesThm,
                            purse.get("id"),
                            Nil,
                            *ch6
                          ) |
                          for (@pursesDataThm <<- @(*vault, "pursesData", contractId)) {
                            TreeHashMap!(
                              "set",
                              pursesDataThm,
                              purse.get("id"),
                              Nil,
                              *ch7
                            )
                          } |
                          for (_ <- ch5; _ <- ch6; _ <- ch7) {
                            stdout!(contractId ++ "/" ++ purse.get("boxId") ++ " purse " ++ purse.get("id") ++ " merged into purse " ++ purse2.get("id")) |
                            @return!((true, purse)) |
                            @(*vault, "boxes", purse.get("boxId"))!(box)
                          }
                        }
                        _ => {
                          stdout!(contractId ++ "/" ++ purse.get("boxId") ++ " purse " ++ purse.get("id") ++ " saved to box") |
                          @(*vault, "boxes", purse.get("boxId"))!(box.set(
                            contractId,
                            box.get(contractId).union(Set(purse.get("id")))
                          )) |
                          @return!((true, purse))
                        }
                      }
                    }

                  }
                }
                Set(first ... rest) => {
                  new ch4, ch5, ch6, ch7 in {
                    TreeHashMap!("get", pursesThm, first, *ch4) |
                    for (@purse2 <- ch4) {
                      match purse2.get("price") == purse.get("price") {
                        true => {
                          TreeHashMap!(
                            "set",
                            pursesThm,
                            first,
                            purse2.set("quantity", purse2.get("quantity") + purse.get("quantity")),
                            *ch5
                          ) |
                          TreeHashMap!(
                            "set",
                            pursesThm,
                            purse.get("id"),
                            Nil,
                            *ch6
                          ) |
                          for (@pursesDataThm <<- @(*vault, "pursesData", contractId)) {
                            TreeHashMap!(
                              "set",
                              pursesDataThm,
                              purse.get("id"),
                              Nil,
                              *ch7
                            )
                          } |
                          for (_ <- ch5; _ <- ch6; _ <- ch7) {
                            stdout!(contractId ++ "/" ++ purse.get("boxId") ++ " purse " ++ purse.get("id") ++ " merged into purse " ++ purse2.get("id")) |
                            @return!((true, purse)) |
                            @(*vault, "boxes", purse.get("boxId"))!(box)
                          }
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
            itCh!(box.get(contractId))
          }
        }
      }
    } |

    /*
      makePurseCh
      only place where new purses are created:
      PURCHASE, WITHDRAW, and CREATE_PURSE may call this channel

      depending on if .fungible is true or false, it decides
      which id to give to the new purse, then it creates the
      purse and saves to box
    */
    for (@(contractId, properties, data, merge, return) <= makePurseCh) {
      new ch1, ch2, ch3, ch4, idAndQuantityCh in {
        for (@contractConfig <<- @(*vault, "contractConfig", contractId)) {
          if (contractConfig.get("fungible") == true) {
            for (_ <- @(*vault, "contractConfig", contractId)) {
              @(*vault, "contractConfig", contractId)!(contractConfig.set("counter", contractConfig.get("counter") + 1))
            } |
            idAndQuantityCh!({ "id": "\${n}" %% { "n": contractConfig.get("counter") }, "quantity": properties.get("quantity") })
          } else {
            for (@pursesThm <<- @(*vault, "purses", contractId)) {
              TreeHashMap!("get", pursesThm, properties.get("id"), *ch1) |
              for (@existingPurse <- ch1) {

                // check that nft does not exist
                if (existingPurse == Nil) {
                  if (properties.get("id") == "0") {
                    idAndQuantityCh!({ "id": properties.get("id"), "quantity": properties.get("quantity") })
                  } else {
                    idAndQuantityCh!({ "id": properties.get("id"), "quantity": 1 })
                  }
                } else {

                  // nft with id: "0" is a special nft from which
                  // anyone can mint a nft that does not exist yet
                  // used by dappy name system for example
                  if (properties.get("id") == "0") {
                    TreeHashMap!("get", pursesThm, properties.get("newId"), *ch2) |
                    for (@purseWithNewId <- ch2) {
                      match (properties.get("newId"), purseWithNewId) {
                        (String, Nil) => {
                          idAndQuantityCh!({ "id": properties.get("newId"), "quantity": 1 })
                        }
                        _ => {
                          @return!("error: no .newId in payload or .newId already exists")
                        }
                      }
                    }
                  } else {
                    @return!("error: purse id already exists")
                  }
                }
              }
            }
          }
        } |
        for (@idAndQuantity <- idAndQuantityCh) {
          match properties
            .set("id", idAndQuantity.get("id"))
            .set("quantity", idAndQuantity.get("quantity"))
            .delete("newId")
          {
            purse => {
              match (purse, purse.get("id").length() > 0, purse.get("id").length() < 25) {
                ({
                  "quantity": Int,
                  "timestamp": Int,
                  "boxId": String,
                  "id": String,
                  "price": Nil \\/ Int
                }, true, true) => {
                  for (@pursesDataThm <<- @(*vault, "pursesData", contractId)) {
                    for (@pursesThm <<- @(*vault, "purses", contractId)) {
                      TreeHashMap!("set", pursesThm, purse.get("id"), purse, *ch3) |
                      TreeHashMap!("set", pursesDataThm, purse.get("id"), data, *ch4)
                    }
                  } |

                  for (_ <- ch3; _ <- ch4) {
                    savePurseInBoxCh!((contractId, purse, merge, return))
                  }
                }
                _ => {
                  @return!("error: invalid purse, one of the following errors: id length must be between length 1 and 24")
                }
              }
            }
          }
        }
      }
    } |

    // ====================================
    // ===== ANY USER / PUBLIC capabilities
    // ====================================

    for (@("PUBLIC_READ_PURSES_AT_INDEX", contractId, i, return) <= entryCh) {
      new ch1 in {
        getContractPursesThmCh!((contractId, *ch1)) |
        for (@pursesThm <- ch1) {
          if (pursesThm == Nil) {
            @return!("error: contract not found")
          } else {
            TreeHashMap!("getValuesAtIndex", pursesThm, i, return)
          }
        }
      }
    } |

    for (@("PUBLIC_READ_CONFIG", contractId, return) <= entryCh) {
      for (@config <<- @(*vault, "contractConfig", contractId)) {
        @return!(config)
      }
    } |

    for (@("PUBLIC_READ_BOX", boxId, return) <= entryCh) {
      new ch1 in {
        getBoxCh!((boxId, *ch1)) |
        for (@box <- ch1) {
          if (box == Nil) {
            @return!("error: box not found")
          } else {
            for (@superKeys <<- @(*vault, "boxesSuperKeys", boxId)) {
              for (@config <<- @(*vault, "boxConfig", boxId)) {
                @return!(config.union({ "superKeys": superKeys, "purses": box, "version": "15.0.2" }))
              }
            }
          }
        }
      }
    } |

    for (@("PUBLIC_READ_LOGS", contractId, return) <= entryCh) {
      new ch1 in {
        getContractPursesThmCh!((contractId, *ch1)) |
        for (@pursesThm <- ch1) {
          if (pursesThm == Nil) {
            @return!("error: contract not found")
          } else {
            for (@logs <<- @(*vault, "LOGS", contractId)) {
              @return!((true, logs))
            }
          }
        }
      }
    } |

    for (@("PUBLIC_READ_PURSE", payload, return) <= entryCh) {
      new ch1 in {
        getContractPursesThmCh!((payload.get("contractId"), *ch1)) |
        for (@pursesThm <- ch1) {
          if (pursesThm == Nil) {
            @return!("error: contract not found")
          } else {
            match payload.get("purseId") {
              String => {
                TreeHashMap!("get", pursesThm, payload.get("purseId"), return)
              }
              _ => {
                @return!("error: payload.purseId must be a string")
              }
            }
          }
        }
      }
    } |

    for (@("PUBLIC_READ_PURSE_DATA", payload, return) <= entryCh) {
      new ch1 in {
        getContractPursesDataThmCh!((payload.get("contractId"), *ch1)) |
        for (@pursesDataThm <- ch1) {
          if (pursesDataThm == Nil) {
            @return!("error: contract not found")
          } else {
            match payload.get("purseId") {
              String => {
                TreeHashMap!("get", pursesDataThm, payload.get("purseId"), return)
              }
              _ => {
                @return!("error: payload.purseId must be a string")
              }
            }
          }
        }
      }
    } |

    for (@("PUBLIC_DELETE_EXPIRED_PURSE", contractId, purseId, return) <= entryCh) {
      for (@config <<- @(*vault, "contractConfig", contractId)) {
        match (config.get("fungible"), purseId == "0", config.get("expires")) {
          (false, false, Int) => {
            new ch1, ch2, ch3, ch4, ch5, ch6, ch7 in {
              getContractPursesThmCh!((contractId, *ch1)) |
              getContractPursesDataThmCh!((contractId, *ch2)) |
              for (@pursesThm <- ch1; @pursesDataThm <- ch2) {
                if (pursesThm == Nil) {
                  @return!("error: contract not found")
                } else {
                  TreeHashMap!("get", pursesThm, purseId, *ch3) |
                  for (@purse <- ch3) {
                    if (purse == Nil) {
                      @return!("error: purse not found")
                    } else {
                      blockData!(*ch4) |
                      for (_, @timestamp, _ <- ch4) {
                        if (timestamp - purse.get("timestamp") > config.get("expires")) {
                          TreeHashMap!("set", pursesThm, purse.get("id"), Nil, *ch5) |
                          TreeHashMap!("set", pursesDataThm, purse.get("id"), Nil, *ch6) |
                          removePurseInBoxCh!((purse.get("boxId"), contractId, purse.get("id"), *ch7)) |
                          for (_ <- ch5; _ <- ch6; _ <- ch7) {
                            @return!((true, Nil))
                          }
                        } else {
                          @return!("error: purse has not expired")
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          _ => {
            @return!("error: contract must not be fungible, and must have .expires property")
          }
        }
      }
    } |

    for (@("PUBLIC_REGISTER_BOX", payload, return) <= entryCh) {
      match (payload.get("boxId"), payload.get("publicKey"), payload.get("boxId").length() > 1, payload.get("boxId").length() < 25) {
        (String, String, true, true) => {
          new ch1, ch2, ch3, ch4, ch5, ch6, ch7 in {
            registryLookup!(\`rho:rchain:revVault\`, *ch3) |
            for (@(_, RevVault) <- ch3) {
              revAddress!("fromPublicKey", payload.get("publicKey").hexToBytes(), *ch4) |
              for (@a <- ch4) {
                @RevVault!("findOrCreate", a, *ch5) |
                for (@b <- ch5) {
                  match b {
                    (true, vaultFromPublicKey) => {
                      validateStringCh!((payload.get("boxId"), *ch7)) |
                      for (@valid <- ch7) {
                        if (valid == true) {
                          for (@prefix <<- prefixCh) {
                            match prefix ++ payload.get("boxId") {
                              boxId => {
                                ch6!(boxId) |
                                TreeHashMap!("get", boxesThm, boxId, *ch1)
                              }
                            }
                          }
                        } else {
                          @return!("error: invalid box id")
                        }
                      }
                    }
                    _ => {
                      @return!("error: invalid public key, could not get vault")
                    }
                  }
                }
              }
            } |

            for (@existingBox <- ch1; @boxId <- ch6) {
               if (existingBox == Nil) {
                new boxCh in {
                  TreeHashMap!("set", boxesThm, boxId, "exists", *ch2) |
                  for (_ <- ch2) {
                    @(*vault, "boxes", boxId)!({}) |
                    @(*vault, "boxesSuperKeys", boxId)!(Set()) |
                    @(*vault, "boxConfig", boxId)!({ "publicKey": payload.get("publicKey") }) |
                    @return!((true, { "boxId": boxId, "boxCh": bundle+{*boxCh} })) |
                    initLocksForBoxCh!(boxId) |
                    initializeOCAPOnBoxCh!((*boxCh, boxId))
                  }
                }
              } else {
                @return!("error: box already exists")
              } 
            }
          }
        }
      }
    } |

    for (@(boxCh, boxId) <= initializeOCAPOnBoxCh) {
      for (@("REGISTER_CONTRACT", payload, return) <= @boxCh) {
        for (_ <- @(*vault, "REGISTER_CONTRACT_LOCK", boxId)) {
          new registerContract, ch1, ch2, ch3, ch4, ch5, ch6, unlock in {
            for (@result <- unlock) {
              @(*vault, "REGISTER_CONTRACT_LOCK", boxId)!(Nil) |
              @return!(result)
            } |
            match payload {
              { "contractId": String, "fungible": Bool, "fee": Nil \\/ (String, Int), "expires": Nil \\/ Int } => {
                match (payload.get("contractId").length() > 1, payload.get("contractId").length() < 25) {
                  (true, true) => {
                    validateStringCh!((payload.get("contractId"), *ch6)) |
                    for (@prefix <<- prefixCh) {
                      for (@valid <- ch6) {
                        if (valid == true) {
                          if (payload.get("expires") == Nil) {
                            registerContract!(prefix ++ payload.get("contractId"))
                          } else {
                            // minimum 2 hours expiration
                            if (payload.get("expires") >= 1000 * 60 * 60 * 2) {
                              registerContract!(prefix ++ payload.get("contractId"))
                            } else {
                              unlock!("error: .expires must be at least 2 hours")
                            }
                          }
                        } else {
                          unlock!("error: invalid contract id")
                        }
                      }
                    }
                  }
                  _ => {
                    unlock!("error: invalid contract id")
                  }
                }
              }
              _ => {
                unlock!("error: invalid payload")
              }
            } |
            for (@contractId <- registerContract) {
              TreeHashMap!("get", contractsThm, contractId, *ch1) |
              for (@exists <- ch1) {
                if (exists == Nil) {
                  TreeHashMap!("init", ${payload.contractDepth || 2}, true, *ch2) |
                  TreeHashMap!("init", ${payload.contractDepth || 2}, true, *ch4) |
                  TreeHashMap!("set", contractsThm, contractId, "exists", *ch3) |
                  for (@pursesThm <- ch2; @pursesDataThm <- ch4; _ <- ch3) {

                    for (@superKeys <- @(*vault, "boxesSuperKeys", boxId)) {
                      @(*vault, "boxesSuperKeys", boxId)!(
                        superKeys.union(Set(contractId))
                      )
                    } |

                    // purses tree hash map
                    @(*vault, "purses", contractId)!(pursesThm) |

                    // purses data tree hash map
                    @(*vault, "pursesData", contractId)!(pursesDataThm) |

                    // config
                    @(*vault, "contractConfig", contractId)!(
                      payload.set("contractId", contractId).set("locked", false).set("counter", 1).set("version", "15.0.2").set("fee", payload.get("fee"))
                    ) |

                    new superKeyCh in {
                      // return the bundle+ super key
                      unlock!((true, { "superKey": bundle+{*superKeyCh}, "contractId": contractId })) |
                      @(*vault, "LOGS", contractId)!("") |
                      initLocksForContractCh!(contractId) |

                      for (@("LOCK", return2) <= superKeyCh) {
                        for (_ <- @(*vault, "CONTRACT_LOCK", contractId)) {
                          for (@contractConfig <<- @(*vault, "contractConfig", contractId)) {
                            if (contractConfig.get("locked") == true) {
                              @return2!("error: contract is already locked") |
                              @(*vault, "CONTRACT_LOCK", contractId)!(Nil)
                            } else {
                              for (_ <- @(*vault, "contractConfig", contractId)) {
                                @(*vault, "contractConfig", contractId)!(contractConfig.set("locked", true)) |
                                @return2!((true, Nil)) |
                                @(*vault, "CONTRACT_LOCK", contractId)!(Nil)
                              }
                            }
                          }
                        }
                      } |

                      for (@("UPDATE_FEE", payload2, return2) <= superKeyCh) {
                        stdout!("UPDATE_FEE") |
                        stdout!(payload2) |
                        for (_ <- @(*vault, "CONTRACT_LOCK", contractId)) {
                          stdout!("aquired lock") |
                          for (@contractConfig <<- @(*vault, "contractConfig", contractId)) {
                            if (contractConfig.get("locked") == true) {
                              @return2!("error: contract is locked") |
                              @(*vault, "CONTRACT_LOCK", contractId)!(Nil)
                            } else {
                              match payload2 {
                                { "fee": Nil \\/ (String, Int) } => {
                                  stdout!("UPDATE_FEE match") |
                                  @(*vault, "CONTRACT_LOCK", contractId)!(Nil) |
                                  for (@contractConfig <- @(*vault, "contractConfig", contractId)) {
                                    stdout!(contractConfig) |
                                    @(*vault, "contractConfig", contractId)!(
                                      contractConfig.set("fee", payload2.get("fee"))
                                    ) |
                                    @return2!((true, Nil))
                                  }
                                }
                                _ => {
                                  stdout!("UPDATE_FEE nomatch") |
                                  @return2!("error: payload.fee should be a Nil or (String, Int)") |
                                  @(*vault, "CONTRACT_LOCK", contractId)!(Nil)
                                }
                              }
                            }
                          }
                        }
                      } |

                      for (@("DELETE_PURSE", payload2, return2) <= superKeyCh) {
                        for (_ <- @(*vault, "CONTRACT_LOCK", contractId)) {
                          for (@contractConfig <<- @(*vault, "contractConfig", contractId)) {
                            if (contractConfig.get("locked") == true) {
                              @return2!("error: contract is locked") |
                              @(*vault, "CONTRACT_LOCK", contractId)!(Nil)
                            } else {
                              match payload2 {
                                { "purseId": String } => {
                                  new ch1, ch2, ch3, ch4 in {
                                    for (@pursesThm <<- @(*vault, "purses", contractId)) {
                                      TreeHashMap!("get", pursesThm, payload2.get("purseId"), *ch2) |
                                      for (@purseToDelete <- ch2) {
                                        if (purseToDelete == Nil) {
                                          @return2!("error: purse does not exist") |
                                          @(*vault, "CONTRACT_LOCK", contractId)!(Nil)
                                        } else {
                                          removePurseInBoxCh!((purseToDelete.get("boxId"), contractId, payload2.get("purseId"), *ch4)) |
                                          TreeHashMap!("set", pursesThm, payload2.get("purseId"), Nil, *ch3) |
                                          for (@a <- ch3; @b <- ch4) {
                                            @(*vault, "CONTRACT_LOCK", contractId)!(Nil) |
                                            match (a, b) {
                                              (Nil, (true, Nil)) => {
                                                @return2!((true, Nil))
                                              }
                                              _ => {
                                                stdout!(a) |
                                                stdout!(b) |
                                                @return2!("error: CRITICAL purse removal went wrong")
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                                _ => {
                                  @return2!("error: payload.purseId should be a string") |
                                  @(*vault, "CONTRACT_LOCK", contractId)!(Nil)
                                }
                              }
                            }
                          }
                        }
                      } |

                      for (@("CREATE_PURSE", payload2, return2) <= superKeyCh) {
                        for (_ <- @(*vault, "CONTRACT_LOCK", contractId)) {
                          for (@contractConfig <<- @(*vault, "contractConfig", contractId)) {
                            if (contractConfig.get("locked") == true) {
                              @return2!("error: contract is locked") |
                              @(*vault, "CONTRACT_LOCK", contractId)!(Nil)
                            } else {
                              new blockDataCh, ch1, ch2, ch3 in {
                                blockData!(*blockDataCh) |
                                for (_, @timestamp, _ <- blockDataCh) {
                                  match (payload2, payload2.get("price") == 0) {
                                    ({
                                      "data": _,
                                      "quantity": Int,
                                      "id": String,
                                      "price": Nil \\/ Int,
                                      "boxId": String
                                    }, false) => {
                                      getBoxCh!((payload2.get("boxId"), *ch1)) |
                                      validateStringCh!((payload2.get("id"), *ch3)) |
                                      for (@box <- ch1; @valid <- ch3) {
                                        if (valid == true) {
                                          if (box == Nil) {
                                            @return2!("error: box not found " ++ payload2.get("boxId")) |
                                            @(*vault, "CONTRACT_LOCK", contractId)!(Nil)
                                          } else {
                                            makePurseCh!((
                                              contractId,
                                              payload2.delete("data").set("timestamp", timestamp),
                                              payload2.get("data"),
                                              true,
                                              *ch2
                                            )) |
                                            for (@r <- ch2) {
                                              @(*vault, "CONTRACT_LOCK", contractId)!(Nil) |
                                              match r {
                                                String => {
                                                  @return2!(r)
                                                }
                                                (true, newPurse) => {
                                                  @return2!(true)
                                                }
                                              }
                                            }
                                          }
                                        } else {
                                          @return2!("error: invalid id property") |
                                          @(*vault, "CONTRACT_LOCK", contractId)!(Nil)
                                        }
                                      }
                                    }
                                    _ => {
                                      @return2!("error: invalid purse payload") |
                                      @(*vault, "CONTRACT_LOCK", contractId)!(Nil)
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
                } else {
                  unlock!("error: contract id already exists")
                }
              }
            }
          }
        }
      } |

      for (@("UPDATE_PURSE_PRICE", payload, return) <= @boxCh) {
        for (_ <- @(*vault, "UPDATE_PURSE_PRICE_LOCK", boxId)) {
          new ch3, ch4, ch5, unlock in {
            for (@result <- unlock) {
              @(*vault, "UPDATE_PURSE_PRICE_LOCK", boxId)!(Nil) |
              @return!(result)
            } |
            match (payload, payload.get("price") == 0) {
              ({ "price": Int \\/ Nil, "contractId": String, "purseId": String }, false) => {
                getBoxCh!((boxId, *ch3)) |
                for (@box <- ch3) {
                  if (box != Nil) {
                    getPurseCh!((box, payload.get("contractId"), payload.get("purseId"), *ch4)) |
                    for (@purse <- ch4) {
                      if (purse != Nil) {
                        for (@pursesThm <<- @(*vault, "purses", payload.get("contractId"))) {
                          TreeHashMap!("set", pursesThm, payload.get("purseId"), purse.set("price", payload.get("price")), *ch5) |
                          for (_ <- ch5) {
                            unlock!((true, Nil))
                          }
                        }
                      } else {
                        unlock!("error: purse not found")
                      }
                    }
                  } else {
                    unlock!("error: CRITICAL purse removal went wrong box not found")
                  }
                }
              }
              _ => {
                unlock!("error: invalid payload for update price")
              }
            }
          }
        }
      } |

      for (@("UPDATE_PURSE_DATA", payload, return) <= @boxCh) {
        for (_ <- @(*vault, "UPDATE_PURSE_DATA_LOCK", boxId)) {
          new ch3, ch4, ch5, unlock in {
            for (@result <- unlock) {
              @(*vault, "UPDATE_PURSE_DATA_LOCK", boxId)!(Nil) |
              @return!(result)
            } |
            match payload {
              { "data": _, "contractId": String, "purseId": String } => {
                getBoxCh!((boxId, *ch3)) |
                for (@box <- ch3) {
                  if (box != Nil) {
                    getPurseCh!((box, payload.get("contractId"), payload.get("purseId"), *ch4)) |
                    for (@purse <- ch4) {
                      if (box != Nil) {
                        for (@pursesDataThm <<- @(*vault, "pursesData", payload.get("contractId"))) {
                          TreeHashMap!("set", pursesDataThm, payload.get("purseId"), payload.get("data"), *ch5) |
                          for (_ <- ch5) {
                            unlock!((true, Nil))
                          }
                        }
                      } else {
                        unlock!("error: purse not found")
                      }
                    }
                  } else {
                    unlock!("error: CRITICAL box not found")
                  }
                }
              }
              _ => {
                unlock!("error: invalid payload for update data")
              }
            }
          }
        }
      } |

      for (@("RENEW", payload, return) <= @boxCh) {
        for (_ <- @(*vault, "RENEW_LOCK", boxId)) {
          new ch1, ch2, ch3, ch4, renewStep2, ch20, renewStep3, ch30, ch31, ch32, ch33, ch34, ch35, ch36, unlock in {
            for (@result <- unlock) {
              @(*vault, "RENEW_LOCK", boxId)!(Nil) |
              @return!(result)
            } |
            match payload {
              { "contractId": String, "purseId": String, "purseRevAddr": String, "purseAuthKey": _ } => {
                getBoxCh!((boxId, *ch1)) |
                for (@box <- ch1) {
                  if (box != Nil) {
                    getContractPursesThmCh!((payload.get("contractId"), *ch2)) |
                    getPurseCh!((box, payload.get("contractId"), payload.get("purseId"), *ch3)) |

                    for (@pursesThm <- ch2) {
                      if (pursesThm == Nil) {
                        unlock!("error: CRITICAL tree hash map not found")
                      } else {
                        TreeHashMap!("get", pursesThm, "0", *ch4)
                      } |
                      for (@purse <- ch3; @purseZero <- ch4) {
                        for (@contractConfig <<- @(*vault, "contractConfig", payload.get("contractId"))) {
                          match (contractConfig.get("expires"), contractConfig.get("fungible") == false, purse != Nil, purseZero != Nil) {
                            (Int, true, true, true) => {
                              renewStep2!((pursesThm, purseZero, purse, contractConfig.get("expires")))
                            }
                            _ => {
                              unlock!("error: purse 0 not found or contract is fungible=true")
                            }
                          }
                        }
                      }
                    }
                  } else {
                    unlock!("error: CRITICAL box not found")
                  }
                }
              }
              _ => {
                unlock!("error: invalid payload for renew")
              }
            } |

            for (@(pursesThm, purseZero, purse, expires) <- renewStep2) {
              blockData!(*ch20) |
              for (_, @timestamp, _ <- ch20) {
                match expires / 10 {
                  grace => {
                    match purse.get("timestamp") + expires - grace {
                      startOfGracePeriod => {
                        if (timestamp > startOfGracePeriod) {
                          renewStep3!((pursesThm, purseZero, purse, expires))
                        } else {
                          unlock!("error: to soon to renew")
                        }
                      }
                      _ => {
                        unlock!("error: cannot calculate grace period")
                      }
                    }
                  }
                  _ => {
                    unlock!("error: cannot calculate grace period")
                  }
                }
              }
            } |

            for (@(pursesThm, purseZero, purse, expires) <- renewStep3) {
              for (@boxConfig <<- @(*vault, "boxConfig", purseZero.get("boxId"))) {
                registryLookup!(\`rho:rchain:revVault\`, *ch33) |
                for (@(_, RevVault) <- ch33) {
                  @RevVault!("findOrCreate", payload.get("purseRevAddr"), *ch34) |
                  revAddress!("fromPublicKey", boxConfig.get("publicKey").hexToBytes(), *ch32)
                }
              } |

              for (@revAddr <- ch32; @r <- ch34) {
                match r {
                  (true, purseVaultEmitter) => {
                    if (purseZero.get("price") == Nil) {
                      @purseVaultEmitter!("transfer", revAddr, 1, payload.get("purseAuthKey"), *ch35)
                    } else if (purseZero.get("price") == 0) {
                      @purseVaultEmitter!("transfer", revAddr, 1, payload.get("purseAuthKey"), *ch35)
                    } else {
                      @purseVaultEmitter!("transfer", revAddr, purseZero.get("price"), payload.get("purseAuthKey"), *ch35)
                    }
                  }
                  _ => {
                    unlock!("error: could not find vaule from rev address")
                  }
                }
              } |

              for (@paymentResult <- ch35) {
                match paymentResult {
                  (true, Nil) => {
                    TreeHashMap!("set", pursesThm, purse.get("id"), purse.set("timestamp", purse.get("timestamp") + expires), *ch36) |
                    for (_ <- ch36) {
                      unlock!((true, Nil))
                    }
                  }
                  _ => {
                    unlock!("error: failed to execute payment")
                  }
                }
              }
            }
          }
        }
      } |

      for (@("WITHDRAW", payload, return) <= @boxCh) {
        // todo can we have a lock that is only
        // scoped to fromBox and toBox ?
        new ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, proceedWithdrawCh, mergeCh, mergeOkCh, unlock in {
          for (@result <- unlock) {
            @(*vault, "CONTRACT_LOCK", payload.get("contractId"))!(Nil) |
            @return!(result)
          } |
          match payload {
            { "quantity": Int, "contractId": String, "purseId": String, "toBoxId": String, "merge": Bool } => {
              getContractPursesThmCh!((payload.get("contractId"), *ch4)) |
              getBoxCh!((payload.get("toBoxId"), *ch6)) |
              getBoxCh!((boxId, *ch10)) |
              for (@pursesThm <- ch4; @toBox <- ch6; @box <- ch10) {
                match (pursesThm != Nil, toBox != Nil, box != Nil) {
                  (true, true, true) => {
                    getPurseCh!((box, payload.get("contractId"), payload.get("purseId"), *ch9)) |
                    for (@purse <- ch9) {
                      if (purse == Nil) {
                        @return!("error: purse does not exist")
                      } else {
                        if (purse.get("id") != "0") {
                          for (_ <- @(*vault, "CONTRACT_LOCK", payload.get("contractId"))) {
                            proceedWithdrawCh!((pursesThm, purse))
                          }
                        } else {
                          @return!("error: withdraw from special nft 0 is forbidden")
                        }
                      }
                    }
                  }
                  _ => {
                    @return!("error: contract or recipient box does not exist")
                  }
                }
              }
            }
            _ => {
              @return!("error: invalid payload for withdraw")
            }
          } |

          for (@(pursesThm, purse) <- proceedWithdrawCh) {

            // the withdrawer should not be able to choose if
            // tokens in recipient box will or will not be 
            // merged, except if he withdraws to himself
            mergeCh!(payload.get("merge")) |
            if (payload.get("toBoxId") != boxId) {
              for (_ <- mergeCh) {
                mergeOkCh!(true)
              }
            } else {
              for (@m <- mergeCh) {
                mergeOkCh!(m)
              }
            } |

            for (@merge <- mergeOkCh) {
              match (
                purse.get("quantity") - payload.get("quantity") >= 0,
                purse.get("quantity") > 0,
                purse.get("quantity") - payload.get("quantity") > 0
              ) {

                // ajust quantity in first purse, create a second purse
                // associated with toBoxId
                (true, true, true) => {
                  TreeHashMap!("set", pursesThm, payload.get("purseId"), purse.set("quantity", purse.get("quantity") - payload.get("quantity")), *ch5) |
                  for (_ <- ch5) {
                    makePurseCh!((
                      payload.get("contractId"),
                      purse
                        .set("price", Nil)
                        .set("quantity", payload.get("quantity"))
                        .set("boxId", payload.get("toBoxId")),
                      Nil,
                      merge,
                      *unlock
                    ))
                  }
                }

                // remove first purse, create a second purse
                // associated with toBoxId
                (true, true, false) => {
                  TreeHashMap!("set", pursesThm, payload.get("purseId"), Nil, *ch5) |
                  for (@pursesDataThm <<- @(*vault, "pursesData", payload.get("contractId"))) {
                    TreeHashMap!(
                      "get",
                      pursesDataThm,
                      payload.get("purseId"),
                      *ch7
                    ) |
                    for (_ <- ch5; @data <- ch7) {
                      TreeHashMap!(
                        "set",
                        pursesDataThm,
                        payload.get("purseId"),
                        Nil,
                        *ch11
                      ) |
                      for (_ <- ch11) {
                        removePurseInBoxCh!((boxId, payload.get("contractId"), payload.get("purseId"), *ch8)) |
                        for (@r <- ch8) {
                          match r {
                            String => {
                              unlock!(r)
                            }
                            _ => {
                              makePurseCh!((
                                payload.get("contractId"),
                                purse
                                  .set("price", Nil)
                                  .set("boxId", payload.get("toBoxId")),
                                data,
                                merge,
                                *unlock
                              ))
                            }
                          }
                        }
                      }
                    }
                  }
                }
                _ => {
                  unlock!("error: cannot withdraw, quantity in payload is superior to existing purse quantity")
                }
              }
            }
          }
        }
      } |

      // keep review from here

      for (@(amount, contractConfig, return2) <= calculateFeeCh) {
        if (contractConfig.get("fee") == Nil) {
          @return2!((amount, 0, Nil))
        } else {
          match amount * contractConfig.get("fee").nth(1) / 100000 {
            feeAmount => {
              new ch1 in {
                revAddress!("fromPublicKey", contractConfig.get("fee").nth(0).hexToBytes(), *ch1) |
                for (@revAddr <- ch1) {
                  @return2!((amount - feeAmount, feeAmount, revAddr))
                }
              }
            }
          }
        }
      } |

      // transfers an amount to a temporary escrow purse
      for (@(emitterRevAddress, emitterPurseAuthKey, amount, return) <= transferToEscrowPurseCh) {
        new ch1, ch2, ch3, ch4, ch5, ch6 in {
          registryLookup!(\`rho:rchain:revVault\`, *ch1) |
          for (@(_, RevVault) <- ch1) {
            @RevVault!("findOrCreate", emitterRevAddress, *ch2) |
            for (@a <- ch2) {
              match a {
                (true, purseVaultEmitter) => {
                  new unf in {
                    @RevVault!("unforgeableAuthKey", *unf, *ch3) |
                    revAddress!("fromUnforgeable", *unf, *ch4) |
                    for (@escrowPurseAuthKey <- ch3; @escrowPurseRevAddr <- ch4) {
                      @RevVault!("findOrCreate", escrowPurseRevAddr, *ch5) |
                      for (@(true, escrowPurseVault) <- ch5) {
                        @purseVaultEmitter!("transfer", escrowPurseRevAddr, amount, emitterPurseAuthKey, *ch6) |
                        for (@escrowTransferResult <- ch6) {
                          match escrowTransferResult {
                            (true, Nil) => {
                              @return!((escrowPurseAuthKey, escrowPurseRevAddr))
                            }
                            _ => {
                              stdout!(escrowTransferResult) |
                              @return!("error: escrow transfer went wrong, invalid rev purse")
                            }
                          }
                        }
                      }
                    }
                  }
                }
                _ => {
                  @return!("error: cannot create purse vault")
                }
              }
            }
          }
        }
      } |

      for (@("PURCHASE", payload, return) <= @boxCh) {
        match payload {
          { "quantity": Int, "contractId": String, "merge": Bool, "purseId": String, "newId": Nil \\/ String, "data": _, "purseRevAddr": String, "purseAuthKey": _ } => {
            new ch3, ch4, ch5, ch6, ch7, ch8, step2Ch, ch20, ch21, ch22, ch23, ch24, step3Ch, rollbackCh, ch30, ch31, ch32, ch33, ch34, ch35, ch36, ch37, step4Ch, ch40, ch41, ch42, ch43, ch44, ch45, step5Ch, ch50, ch51, ch52, ch53, unlock in {

              for (@result <- unlock) {
                @return!(result) |
                @(*vault, "CONTRACT_LOCK", payload.get("contractId"))!(Nil)
              } |

              // STEP 1
              // check box, purse
              getBoxCh!((boxId, *ch3)) |
              validateStringCh!((payload.get("newId"), *ch8)) |
              for (@box <- ch3; @valid <- ch8) {
                if (valid == true) {
                  // todo, remove this check ? box should always exist
                  if (box != Nil) {
                    getContractPursesThmCh!((payload.get("contractId"), *ch4)) |
                    getContractPursesDataThmCh!((payload.get("contractId"), *ch5)) |
                    for (@pursesThm <- ch4; @pursesDataThm <- ch5) {
                      if (pursesThm != Nil) {
                        TreeHashMap!("get", pursesThm, payload.get("purseId"), *ch6) |
                        TreeHashMap!("get", pursesDataThm, payload.get("purseId"), *ch7)
                      } else {
                        @return!("error: contract not found")
                      } |
                      for (@purse <- ch6; @purseData <- ch7) {
                        if (purse != Nil) {
                          for (_ <- @(*vault, "CONTRACT_LOCK", payload.get("contractId"))) {
                            step2Ch!((pursesThm, pursesDataThm, purse, purseData))
                          }
                        } else {
                          @return!("error: purse not found")
                        }
                      }
                    }
                  } else {
                    @return!("error: CRITICAL box not found")
                  }
                } else {
                  @return!("error: invalid newId property")
                }
              } |

              // STEP 2
              // transfer total amount to temporary escrow purse
              // check that both emitter and recipient vault exist
              for (@(pursesThm, pursesDataThm, purse, purseData) <- step2Ch) {
                match (
                  purse.get("price"),
                  purse.get("quantity") > 0,
                  payload.get("quantity") > 0,
                  purse.get("quantity") >= payload.get("quantity")
                ) {
                  (Int, true, true, true) => {
                    registryLookup!(\`rho:rchain:revVault\`, *ch20) |

                    for (@boxConfig <<- @(*vault, "boxConfig", purse.get("boxId"))) {
                      revAddress!("fromPublicKey", boxConfig.get("publicKey").hexToBytes(), *ch21)
                    } |

                    for (@contractConfig <<- @(*vault, "contractConfig", payload.get("contractId"))) {
                      calculateFeeCh!((payload.get("quantity") * purse.get("price"), contractConfig, *ch22))
                    } |

                    for (@(_, RevVault) <- ch20; @ownerRevAddress <- ch21; @amountAndFeeAmount <- ch22) {
                      match (
                        payload.get("purseRevAddr"),
                        ownerRevAddress,
                        amountAndFeeAmount.nth(0),
                        amountAndFeeAmount.nth(1),
                        amountAndFeeAmount.nth(2)
                      ) {
                        (emitterRevAddress, recipientRevAddress, amount, feeAmount, feeRevAddress) => {
                          @RevVault!("findOrCreate", recipientRevAddress, *ch23) |
                          for (@a <- ch23) {
                            match a {
                              (true, purseVaultRecipient) => {
                                transferToEscrowPurseCh!((emitterRevAddress, payload.get("purseAuthKey"), amount + feeAmount, *ch24)) |
                                for (@b <- ch24) {
                                  match b {
                                    String => {
                                      unlock!(b)
                                    }
                                    (escrowPurseAuthKey, escrowPurseRevAddr) => {
                                      step3Ch!((pursesThm, pursesDataThm, purse, purseData, RevVault, escrowPurseRevAddr, escrowPurseAuthKey, emitterRevAddress, recipientRevAddress, amount, feeAmount, feeRevAddress))
                                    }
                                  }
                                }
                              }
                              _ => {
                                unlock!("error: could not find or create vaults")
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  _ => {
                    unlock!("error: quantity not available or purse not for sale")
                  }
                }
              } |

              // STEP 3
              // listen on rollbackCh and prepare to reset state to original
              // if step 4 or 5 fails
              // 
              for (@(pursesThm, pursesDataThm, purse, purseData, RevVault, escrowPurseRevAddr, escrowPurseAuthKey, emitterRevAddress, recipientRevAddress, amount, feeAmount, feeRevAddress) <- step3Ch) {
                for (@message <- rollbackCh) {
                  TreeHashMap!("set", pursesThm, purse.get("id"), purse, *ch30) |
                  TreeHashMap!("set", pursesDataThm, purse.get("id"), purseData, *ch31) |
                  if (purse.get("quantity") - payload.get("quantity") == 0) {
                    savePurseInBoxCh!((payload.get("contractId"), purse, true, *ch32))
                  } else {
                    // the purse has not been removed from box
                    ch32!((true, Nil))
                  } |
                  for (_ <- ch30; _ <- ch31; @a <- ch32) {
                    match a {
                      String => {
                        stdout!("error: CRITICAL could not rollback after makePurse error") |
                        unlock!("error: CRITICAL could not rollback after makePurse error")
                      }
                      _ => {
                        @RevVault!("findOrCreate", escrowPurseRevAddr, *ch33) |
                        for (@(true, purseVaultEscrow) <- ch33) {
                          @purseVaultEscrow!("transfer", emitterRevAddress, amount + feeAmount, escrowPurseAuthKey, *ch34) |
                          for (@r <- ch34) {
                            match r {
                              (true, Nil) => {
                                unlock!("error: rollback successful, makePurse error, transaction was rolled backed, emitter purse was reimbursed " ++ message)
                              }
                              _ => {
                                stdout!(r) |
                                stdout!("error: CRITICAL, makePurse error, could rollback but could not reimburse after makePurse error" ++ message) |
                                unlock!("error: CRITICAL, makePurse error, could rollback but could not reimburse after makePurse error" ++ message)
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                } |
                step4Ch!((pursesThm, pursesDataThm, purse, purseData, RevVault, escrowPurseRevAddr, escrowPurseAuthKey, emitterRevAddress, recipientRevAddress, amount, feeAmount, feeRevAddress))
              } |

              // STEP 4
              // try to makePurse
              for (@(pursesThm, pursesDataThm, purse, purseData, RevVault, escrowPurseRevAddr, escrowPurseAuthKey, emitterRevAddress, recipientRevAddress, amount, feeAmount, feeRevAddress) <- step4Ch) {
                for (@makePurseResult <- ch43) {
                  match makePurseResult {
                    String => {
                      rollbackCh!(makePurseResult)
                    }
                    (true, newPurse) => {
                      step5Ch!((pursesThm, pursesDataThm, purse, purseData, RevVault, escrowPurseRevAddr, escrowPurseAuthKey, emitterRevAddress, recipientRevAddress, amount, feeAmount, feeRevAddress, newPurse))
                    }
                  }
                } |

                // remove completely purse and create a new one
                // with same id, id may be changed by makePurse
                // depending on fungible or not
                if (purse.get("quantity") - payload.get("quantity") == 0) {
                  TreeHashMap!("set", pursesThm, purse.get("id"), Nil, *ch40) |
                  TreeHashMap!("set", pursesDataThm, purse.get("id"), Nil, *ch41) |
                  removePurseInBoxCh!((purse.get("boxId"), payload.get("contractId"), purse.get("id"), *ch42)) |
                  for (_ <- ch40; _ <- ch41; _ <- ch42) {
                    makePurseCh!((
                      payload.get("contractId"),
                      // keep quantity of existing purse
                      purse
                        .set("boxId", boxId)
                        .set("price", Nil)
                        // will only be considered for nft, purchase from purse "0"
                        .set("newId", payload.get("newId")),
                      payload.get("data"),
                      payload.get("merge"),
                      *ch43
                    ))
                  }
                } else {
                  // just update quantity of current purse, and
                  //  create another one with right quantity
                  TreeHashMap!("set", pursesThm, purse.get("id"), purse.set("quantity", purse.get("quantity") - payload.get("quantity")), *ch40) |

                  // purchase NFT from "0", new timestamp
                  if (purse.get("id") == "0") {
                    blockData!(*ch44) |
                    for (_, @timestamp, _ <- ch44) {
                      ch45!(timestamp)
                    }
                  // purchase ft or NFT not "0"
                  // duplicate timestamp
                  } else {
                    ch45!(purse.get("timestamp"))
                  } |

                  for (@timestamp <- ch45) {
                    for (_ <- ch40) {
                      makePurseCh!((
                        payload.get("contractId"),
                        purse
                          .set("boxId", boxId)
                          .set("quantity", payload.get("quantity"))
                          .set("price", Nil)
                          .set("timestamp", timestamp)
                          // will only be considered for nft, purchase from purse "0"
                          .set("newId", payload.get("newId")),
                        payload.get("data"),
                        payload.get("merge"),
                        *ch43
                      ))
                    }
                  }
                }
              } |

              // STEP 5
              // everything went ok, do final payment
              for (@(pursesThm, pursesDataThm, purse, purseData, RevVault, escrowPurseRevAddr, escrowPurseAuthKey, emitterRevAddress, recipientRevAddress, amount, feeAmount, feeRevAddress, newPurse) <- step5Ch) {
                @RevVault!("findOrCreate", escrowPurseRevAddr, *ch50) |
                for (@(true, purseVaultEscrow) <- ch50) {
                  @purseVaultEscrow!("transfer", recipientRevAddress, amount, escrowPurseAuthKey, *ch51) |
                  for (@r <- ch51) {
                    match r {
                      (true, Nil) => {
                        if (feeAmount != 0) {
                          @purseVaultEscrow!("transfer", feeRevAddress, feeAmount, escrowPurseAuthKey, *ch53) |
                          for (@transferFeeReturn <- ch53) {
                            match transferFeeReturn {
                              (true, Nil) => {
                                stdout!("fee transfer successful")
                              }
                              _ => {
                                stdout!("error: CRITICAL could not transfer fee")
                              }
                            }
                          }
                        } |
                        unlock!((true, Nil)) |
                        appendLogsForContract!((payload.get("contractId"), "p", "\${toBox},\${fromBox},\${q},\${p},\${id},\${newId};" %% { "fromBox": boxId, "toBox": purse.get("boxId"), "q": payload.get("quantity"), "p": purse.get("price"), "newId": newPurse.get("id"), "id": payload.get("purseId") }))
                      }
                      _ => {
                        stdout!("error: CRITICAL, makePurse went fine, but could not do final transfer") |
                        rollbackCh!("error: CRITICAL, makePurse went fine, but could not do final transfer")
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
    } |

    insertArbitrary!(bundle+{*entryCh}, *entryUriCh) |

    for (entryUri <- entryUriCh) {
      basket!({
        "status": "completed",
        "registryUri": *entryUri
      }) |
      /* turn URI into a string so we can slice
      and get prefix for boxes and contracts */
      match "\${uri}" %% { "uri": *entryUri } {
        uri => { prefixCh!(uri.slice(7, 10)) }
      } |
      stdout!(("rchain-token master registered at", *entryUri))
    }
  }
}
`;
};
