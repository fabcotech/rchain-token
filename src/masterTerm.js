/* GENERATED CODE, only edit rholang/*.rho files*/
module.exports.masterTerm = (payload) => {
    return `new 
  basket,

  prefixCh,
  entryCh,
  entryUriCh,
  revVaultCh,

  logsCh,
  appendLogCh,

  makePurseCh,
  creditBackCh,
  calculateFeeCh,
  validateStringCh,
  initializeOCAPOnBoxCh,

  initLocksForContractCh,
  initLocksForBoxCh,

  /*
    self is the ultimate local unforgeable in
    master contract, every data is stored in channels that
    derives from *self unforgeable name

    // tree hash map of purses :
    thm <- @(*self, "purses", "contract03")

    // tree hash map of purses data :
    thm <- @(*self, "pursesData", "contract03")

    // contract's configs
    config <- @(*self, "contractConfig", "contract03")

    // box's configs
    config <- @(*self, "boxConfig", "box01")

    // boxes (rholang Map)
    box <- @(*self, "boxes", "box01")

    // super keys of a given box
    superKeys <- @(*self, "boxesSuperKeys", "box01")
  */
  self,

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
  getPurseWithAtLeastQuantityCh,
  getPurseCh,
  getContractPursesThmCh,
  getContractPursesDataThmCh,

  insertArbitrary(\`rho:registry:insertArbitrary\`),
  stdout(\`rho:io:stdout\`),
  revAddress(\`rho:rev:address\`),
  registryLookup(\`rho:registry:lookup\`),
  blockData(\`rho:block:data\`)
in {

  // This line should be replaced by tree hash map implementation
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

  // Global lock for REGISTER_CONTRACT and REGISTER_BOX
  // do not allow concurrency for those operations
  @(*self, "REGISTER_CONTRACT_LOCK")!(Nil) |
  @(*self, "REGISTER_BOX_LOCK")!(Nil) |

  // Scoped locks for WITHDRAW, SWAP and CREATE_PURSE, they can touch 
  // the same boxes or purses, we cannot allow concurrency because we
  //  want to avoid race conditions
  for (@boxId <= initLocksForBoxCh) {
    @(*self, "BOX_LOCK", boxId)!(Nil)
  } |
  for (@contractId <= initLocksForContractCh) {
    @(*self, "CONTRACT_LOCK", contractId)!(Nil)
  } |

  for (@str <= appendLogCh) {
    new ch1 in {
      blockData!(*ch1) |
      for (_, @timestamp, _ <- ch1) {
        logsCh!("\${ts},\${str}" %% { "ts": timestamp, "str": str }) |
        for (str <- logsCh) { Nil }
      }
    }
  } |

  // those two tree hash maps store the existence of
  // boxes or contracts

  // { "box1": "exists", "box2": "exists" }
  TreeHashMap!("init", ${payload.depth || 3}, true, *boxesReadyCh) |

  // { "contract1": "exists", "contract2": "exists" }
  TreeHashMap!("init", ${payload.depth || 3}, false, *contractsReadyCh) |

  registryLookup!(\`rho:rchain:revVault\`, *revVaultCh) |
  for (@boxesThm <- boxesReadyCh; @contractsThm <- contractsReadyCh; @(_, RevVault) <- revVaultCh; @prefix <- prefixCh) {

    // ====================================
    // =================== UTILS / INTERNAL
    // ====================================

    // validate string, used for purse ID, box ID, contract ID
    for (@(str, ret) <= validateStringCh) {
      match (
        str,
        Set("a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9")
      ) {
        (String, az09) => {
          match (str.length() > 0,str.length() < 25) {
            (true, true) => {
              new tmpCh, itCh in {
                for (@i <= itCh) {
                  if (i == str.length()) { @ret!(true) }
                  else {
                    if (az09.contains(str.slice(i, i + 1)) == true) { itCh!(i + 1) }
                    else { @ret!(false) }
                  }
                } |
                itCh!(0)
              }
            }
            _ => {
              @ret!(false)
            }
          }
        }
        _ => { @ret!(false) }
      }
    } |

    // returns the box if it exists
    for (@(boxId, return) <= getBoxCh) {
      new ch1 in {
        TreeHashMap!("get", boxesThm, boxId, *ch1) |
        for (@exists <- ch1) {
          if (exists == "exists") {
            for (@box <<- @(*self, "boxes", boxId)) {
              @return!(box)
            }
          } else {
            @return!(Nil)
          }
        }
      }
    } |

    // return the purse that has at least
    // quantity in box if such exists
    for (@(box, contractId, quantity, return) <= getPurseWithAtLeastQuantityCh) {
      if (box.get(contractId) != Nil) {
        new itCh, ch1, ch2 in {
          getContractPursesThmCh!((contractId, *ch2)) |
          for (@pursesThm <- ch2) {
            for (ids <= itCh) {
              match *ids {
                Set() => { @return!(Nil) }
                Set(last) => {
                  TreeHashMap!("get", pursesThm, last, *ch1) |
                  for (@purse <- ch1) {
                    if (purse.get("quantity") >= quantity) {
                      @return!(purse)
                    } else {
                      @return!(Nil)
                    }
                  }
                }
                Set(first ... rest) => {
                  TreeHashMap!("get", pursesThm, first, *ch1) |
                  for (@purse <- ch1) {
                    if (purse.get("quantity") >= quantity) {
                      @return!(purse)
                    } else {
                      itCh!(rest)
                    }
                  }
                }
              }
            } |
            itCh!(box.get(contractId))
          }
        }
      } else {
        @return!(Nil)
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
            for (@pursesThm <<- @(*self, "purses", contractId)) {
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
            for (@pursesDataThm <<- @(*self, "pursesData", contractId)) {
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
      for (@box <- @(*self, "boxes", boxId)) {
        if (box.get(contractId) == Nil) {
          @return!("error: CRITICAL contract id not found in box") |
          @(*self, "boxes", boxId)!(box)
        } else {
          if (box.get(contractId).contains(purseId) == false) {
            @return!("error: CRITICAL purse does not exists in box") |
            @(*self, "boxes", boxId)!(box)
          } else {
            stdout!(contractId ++ "/" ++ boxId ++ " purse " ++ purseId ++ " removed from box") |
            @(*self, "boxes", boxId)!(box.set(contractId, box.get(contractId).delete(purseId))) |
            @return!((true, Nil))
          }
        }
      }
    } |

    // save purse id in box
    for (@(contractId, purse, merge, return) <= savePurseInBoxCh) {
      new ch1, ch3, iterateAndMergePursesCh in {

        for (@box <- @(*self, "boxes", purse.get("boxId"))) {
          getContractPursesThmCh!((contractId, *ch1)) |
          for (@pursesThm <- ch1) {
            if (pursesThm != Nil) {
              if (box.get(contractId) == Nil) {
                stdout!(contractId ++ "/" ++ purse.get("boxId") ++ " purse " ++ purse.get("id") ++ " saved to box") |
                @(*self, "boxes", purse.get("boxId"))!(box.set(contractId, Set(purse.get("id")))) |
                @return!((true, purse))
              } else {
                if (box.get(contractId).contains(purse.get("id")) == false) {
                  for (@contractConfig <<- @(*self, "contractConfig", contractId)) {
                    match (contractConfig.get("fungible") == true, merge) {
                      (true, true) => {
                        for (@pursesThm <<- @(*self, "purses", contractId)) {
                          TreeHashMap!("get", pursesThm, purse.get("id"), *ch3) |
                          for (@purse <- ch3) {
                            iterateAndMergePursesCh!((box, pursesThm))
                          }
                        }
                      }
                      _ => {
                        stdout!(contractId ++ "/" ++ purse.get("boxId") ++ " purse " ++ purse.get("id") ++ " saved to box") |
                        @(*self, "boxes", purse.get("boxId"))!(box.set(
                          contractId,
                          box.get(contractId).union(Set(purse.get("id")))
                        )) |
                        @return!((true, purse))
                      }
                    }
                  }
                } else {
                  @(*self, "boxes", purse.get("boxId"))!(box) |
                  @return!("error: CRITICAL, purse already exists in box")
                }
              }
            } else {
              @(*self, "boxes", purse.get("boxId"))!(box) |
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
                  @(*self, "boxes", purse.get("boxId"))!(box.set(contractId, Set(purse.get("id")))) |
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
                          for (@pursesDataThm <<- @(*self, "pursesData", contractId)) {
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
                            @(*self, "boxes", purse.get("boxId"))!(box)
                          }
                        }
                        _ => {
                          stdout!(contractId ++ "/" ++ purse.get("boxId") ++ " purse " ++ purse.get("id") ++ " saved to box") |
                          @(*self, "boxes", purse.get("boxId"))!(box.set(
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
                          for (@pursesDataThm <<- @(*self, "pursesData", contractId)) {
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
                            @(*self, "boxes", purse.get("boxId"))!(box)
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
      SWAP, WITHDRAW, and CREATE_PURSE may call this channel

      depending on if .fungible is true or false, it decides
      which id to give to the new purse, then it creates the
      purse and saves to box
    */
    for (@(contractId, properties, data, merge, return) <= makePurseCh) {
      new ch1, ch2, ch3, ch4, idAndQuantityCh in {
        for (@contractConfig <<- @(*self, "contractConfig", contractId)) {
          if (contractConfig.get("fungible") == true) {
            for (_ <- @(*self, "contractConfig", contractId)) {
              @(*self, "contractConfig", contractId)!(contractConfig.set("counter", contractConfig.get("counter") + 1))
            } |
            idAndQuantityCh!({ "id": "\${n}" %% { "n": contractConfig.get("counter") }, "quantity": properties.get("quantity") })
          } else {
            for (@pursesThm <<- @(*self, "purses", contractId)) {
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
              match purse {
                {
                  "quantity": Int,
                  "timestamp": Int,
                  "boxId": String,
                  "id": String,
                  "price": (String, Int) \\/ (String, String) \\/ Nil
                } => {
                  for (@pursesDataThm <<- @(*self, "pursesData", contractId)) {
                    for (@pursesThm <<- @(*self, "purses", contractId)) {
                      TreeHashMap!("set", pursesThm, purse.get("id"), purse, *ch3) |
                      TreeHashMap!("set", pursesDataThm, purse.get("id"), data, *ch4)
                    }
                  } |

                  for (_ <- ch3; _ <- ch4) {
                    if (purse.get("boxId") == "_burn") {
                      stdout!(contractId ++ " purse " ++ purse.get("id") ++ " burned") |
                      @return!((true, purse))
                    } else {
                      savePurseInBoxCh!((contractId, purse, merge, return))
                    }
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
      for (@config <<- @(*self, "contractConfig", contractId)) {
        @return!(config)
      }
    } |

    for (@("PUBLIC_READ_MASTER_CONFIG", return) <= entryCh) {
      @return!({
        "logsCh": *logsCh,
        "depth": ${payload.depth || 3},
        "depthContract": ${payload.contractDepth || 2},
        "version": "17.0.0",
      })
    } |

    for (@("PUBLIC_READ_BOX", boxId, return) <= entryCh) {
      new ch1 in {
        getBoxCh!((boxId, *ch1)) |
        for (@box <- ch1) {
          if (box == Nil) {
            @return!("error: box not found")
          } else {
            for (@superKeys <<- @(*self, "boxesSuperKeys", boxId)) {
              for (@config <<- @(*self, "boxConfig", boxId)) {
                @return!(config.union({ "superKeys": superKeys, "purses": box, "version": "17.0.0" }))
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
            for (@logs <<- @(*self, "LOGS", contractId)) {
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

    for (@("PUBLIC_DELETE_EXPIRED_PURSE", contractId, boxId, purseId, return) <= entryCh) {
      stdout!("PUBLIC_DELETE_EXPIRED_PURSE") |
      new ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, proceeedDeleteCh, unlock in {
        for (@result <- unlock) {
          @(*self, "BOX_LOCK", boxId)!(Nil) |
          @(*self, "CONTRACT_LOCK", contractId)!(Nil) |
          @return!(result)
        } |
        getContractPursesThmCh!((contractId, *ch1)) |
        getBoxCh!((boxId, *ch2)) |
        for (@pursesThm <- ch1; @box <- ch2) {
          stdout!("pursesThm") |
          stdout!(pursesThm) |
          stdout!("box") |
          stdout!(box) |
          if (pursesThm != Nil and box != Nil) {
            for (
              _ <- @(*self, "CONTRACT_LOCK", contractId);
              _ <- @(*self, "BOX_LOCK", boxId)
            ) {
              proceeedDeleteCh!(Nil)
            }
          } else {
            @return!("error: box or contract not found")
          }
        } |

        // RACE SAFE / RESOURCES LOCKED
        // after lock of 1 contract and 1 box
        for (_ <- proceeedDeleteCh) {
          stdout!("proceeedDeleteCh") |
          getContractPursesThmCh!((contractId, *ch3)) |
          getContractPursesDataThmCh!((contractId, *ch4)) |
          for (@pursesThm <- ch3; @pursesDataThm <- ch4) {
            TreeHashMap!("get", pursesThm, purseId, *ch5) |
            for (@purse <- ch5) {
              stdout!("purse") |
              stdout!(purse) |
              if (purse != Nil) {
                if (purse.get("boxId") == boxId) {
                  for (@config <<- @(*self, "contractConfig", contractId)) {
                    match (config.get("fungible"), purseId == "0", config.get("expires")) {
                      (false, false, Int) => {
                        blockData!(*ch6) |
                        for (_, @timestamp, _ <- ch6) {
                          stdout!(("timestamp", timestamp)) |
                          stdout!(("purse.timestamp", purse.get("timestamp"))) |
                          if (timestamp - purse.get("timestamp") > config.get("expires")) {
                            TreeHashMap!("set", pursesThm, purse.get("id"), Nil, *ch7) |
                            TreeHashMap!("set", pursesDataThm, purse.get("id"), Nil, *ch8) |
                            removePurseInBoxCh!((purse.get("boxId"), contractId, purse.get("id"), *ch9)) |
                            for (_ <- ch7; _ <- ch8; _ <- ch9) {
                              unlock!((true, Nil))
                            }
                          } else {
                            unlock!("error: purse has not expired")
                          }
                        }
                      }
                      _ => {
                        unlock!("error: cannot delete")
                      }
                    }
                  }
                } else {
                  unlock!("error: invalid box id")
                }
              } else {
                unlock!("error: purse not found")
              }
            }
          }
        }
      }
    } |

    for (@("PUBLIC_REGISTER_BOX", payload, return) <= entryCh) {
      stdout!("PUBLIC_REGISTER_BOX") |
      stdout!(payload.get("boxId")) |
      stdout!(payload.get("revAddress")) |
      stdout!(payload.get("publicKey")) |
      match (payload.get("boxId"), payload.get("revAddress"), payload.get("publicKey")) {
        (String, String, String) => {
          new ch1, ch2, ch3, ch4, ch5, ch6, ch7, logsCh, registerBoxUnlock in {
            for (@result <- registerBoxUnlock) {
              @(*self, "REGISTER_BOX_LOCK")!(Nil) |
              @return!(result)
            } |

            // Verify that payload.revAddress is a real one with at
            // least 1 dust
            @RevVault!("findOrCreate", payload.get("revAddress"), *ch4) |
            for (@(true, revVault) <- ch4) {
              @revVault!("balance", *ch5) |
              for (@balance <- ch5) {
                match balance {
                  Int => {
                    if (balance == 0) {
                      @return!("error: REV address must have at least 1 dust")
                    } else {
                      validateStringCh!((payload.get("boxId"), *ch7)) |
                      for (@valid <- ch7) {
                        if (valid == true) {
                          match prefix ++ payload.get("boxId") {
                            boxId => {
                              for (_ <- @(*self, "REGISTER_BOX_LOCK")) {
                                ch6!(boxId) |
                                getBoxCh!((boxId, *ch1))
                              }
                            }
                          }
                        } else {
                          @return!("error: invalid box id")
                        }
                      }
                    }
                  }
                  _ => {
                    @return!("error: REV address must have at least 1 dust")
                  }
                }
              }
            } |
            
            for (@existingBox <- ch1; @boxId <- ch6) {
               if (existingBox == Nil) {
                new boxCh in {
                  TreeHashMap!("set", boxesThm, boxId, "exists", *ch2) |
                  for (_ <- ch2) {
                    @(*self, "boxes", boxId)!({}) |
                    @(*self, "boxesSuperKeys", boxId)!(Set()) |
                    @(*self, "boxConfig", boxId)!({ "publicKey": payload.get("publicKey"), "revAddress": payload.get("revAddress") }) |
                    registerBoxUnlock!((true, { "boxId": boxId, "boxCh": bundle+{*boxCh} })) |
                    initLocksForBoxCh!(boxId) |
                    initializeOCAPOnBoxCh!((*boxCh, boxId))
                  }
                }
              } else {
                registerBoxUnlock!("error: box already exists")
              } 
            }
          }
        }
      }
    } |

    for (@(boxCh, boxId) <= initializeOCAPOnBoxCh) {
      for (@("REGISTER_CONTRACT", payload, return) <= @boxCh) {
        new registerContract, ch1, ch2, ch3, ch4, ch5, ch6, registerUnlock, logsCh in {
          for (@result <- registerUnlock) {
            @(*self, "REGISTER_CONTRACT_LOCK")!(Nil) |
            @return!(result)
          } |
          match payload {
            { "contractId": String, "fungible": Bool, "expires": Nil \\/ Int } => {
              for (_ <- @(*self, "REGISTER_CONTRACT_LOCK")) {
                validateStringCh!((payload.get("contractId"), *ch6)) |
                for (@valid <- ch6) {
                  if (valid == true) {
                    if (payload.get("expires") == Nil) {
                      registerContract!(prefix ++ payload.get("contractId"))
                    } else {
                      // minimum 2 hours expiration
                      if (payload.get("expires") >= 1000 * 60 * 60 * 2) {
                        registerContract!(prefix ++ payload.get("contractId"))
                      } else {
                        registerUnlock!("error: .expires must be at least 2 hours")
                      }
                    }
                  } else {
                    registerUnlock!("error: invalid contract id")
                  }
                }
              }
            }
            _ => {
              @return!("error: invalid payload")
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

                  for (@superKeys <- @(*self, "boxesSuperKeys", boxId)) {
                    @(*self, "boxesSuperKeys", boxId)!(
                      superKeys.union(Set(contractId))
                    )
                  } |

                  // purses tree hash map
                  @(*self, "purses", contractId)!(pursesThm) |

                  // purses data tree hash map
                  @(*self, "pursesData", contractId)!(pursesDataThm) |

                  // config
                  @(*self, "contractConfig", contractId)!(
                    payload
                      .set("contractId", contractId)
                      .set("locked", false)
                      .set("counter", 1)
                      .set("version", "17.0.0")
                      .set("fee", Nil)
                      .set("logsCh", *logsCh)
                  ) |

                  new superKeyCh in {
                    // return the bundle+ super key
                    registerUnlock!((true, { "superKey": bundle+{*superKeyCh}, "contractId": contractId })) |
                    @(*self, "LOGS", contractId)!("") |
                    initLocksForContractCh!(contractId) |

                    for (@("LOCK", return2) <= superKeyCh) {
                      for (_ <- @(*self, "CONTRACT_LOCK", contractId)) {
                        for (@contractConfig <<- @(*self, "contractConfig", contractId)) {
                          if (contractConfig.get("locked") == true) {
                            @return2!("error: contract is already locked") |
                            @(*self, "CONTRACT_LOCK", contractId)!(Nil)
                          } else {
                            for (_ <- @(*self, "contractConfig", contractId)) {
                              @(*self, "contractConfig", contractId)!(contractConfig.set("locked", true)) |
                              @return2!((true, Nil)) |
                              @(*self, "CONTRACT_LOCK", contractId)!(Nil)
                            }
                          }
                        }
                      }
                    } |

                    for (@("UPDATE_FEE", payload2, return2) <= superKeyCh) {
                      for (_ <- @(*self, "CONTRACT_LOCK", contractId)) {
                        for (@contractConfig <<- @(*self, "contractConfig", contractId)) {
                          if (contractConfig.get("locked") == true) {
                            @return2!("error: contract is locked") |
                            @(*self, "CONTRACT_LOCK", contractId)!(Nil)
                          } else {
                            match payload2 {
                              { "fee": Nil } => {
                                @(*self, "CONTRACT_LOCK", contractId)!(Nil) |
                                for (@contractConfig <- @(*self, "contractConfig", contractId)) {
                                  @(*self, "contractConfig", contractId)!(
                                    contractConfig.set("fee", payload2.get("fee"))
                                  ) |
                                  @return2!((true, Nil))
                                }
                              }
                              { "fee": (String, Int) } => {
                                new ch1, ch2, ch3, ch4, ch5, ch6, ch7 in {
                                  getBoxCh!((payload2.get("fee").nth(0), *ch1)) |
                                  for (@box <- ch1) {
                                    if (box == Nil) {
                                      @(*self, "CONTRACT_LOCK", contractId)!(Nil) |
                                      @return2!("error: box not found")
                                    } else {
                                      for (@contractConfig <- @(*self, "contractConfig", contractId)) {
                                        @(*self, "contractConfig", contractId)!(
                                          contractConfig.set("fee", payload2.get("fee"))
                                        ) |
                                        @return2!((true, Nil)) |
                                        @(*self, "CONTRACT_LOCK", contractId)!(Nil)
                                      }
                                    }
                                  }
                                }
                              }
                              _ => {
                                @return2!("error: payload.fee should be a Nil or (String, Int)") |
                                @(*self, "CONTRACT_LOCK", contractId)!(Nil)
                              }
                            }
                          }
                        }
                      }
                    } |

                    // todo lock box as well
                    for (@("DELETE_PURSE", payload2, return2) <= superKeyCh) {
                      for (_ <- @(*self, "CONTRACT_LOCK", contractId)) {
                        for (@contractConfig <<- @(*self, "contractConfig", contractId)) {
                          if (contractConfig.get("locked") == true) {
                            @return2!("error: contract is locked") |
                            @(*self, "CONTRACT_LOCK", contractId)!(Nil)
                          } else {
                            match payload2 {
                              { "purseId": String } => {
                                new ch1, ch2, ch3, ch4 in {
                                  for (@pursesThm <<- @(*self, "purses", contractId)) {
                                    TreeHashMap!("get", pursesThm, payload2.get("purseId"), *ch2) |
                                    for (@purseToDelete <- ch2) {
                                      if (purseToDelete == Nil) {
                                        @return2!("error: purse does not exist") |
                                        @(*self, "CONTRACT_LOCK", contractId)!(Nil)
                                      } else {
                                        removePurseInBoxCh!((purseToDelete.get("boxId"), contractId, payload2.get("purseId"), *ch4)) |
                                        TreeHashMap!("set", pursesThm, payload2.get("purseId"), Nil, *ch3) |
                                        for (@a <- ch3; @b <- ch4) {
                                          @(*self, "CONTRACT_LOCK", contractId)!(Nil) |
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
                                @(*self, "CONTRACT_LOCK", contractId)!(Nil)
                              }
                            }
                          }
                        }
                      }
                    } |

                    for (@("CREATE_PURSE", payload2, return2) <= superKeyCh) {
                      new blockDataCh, ch1, ch2, ch3, ch4, proceedCreateCh, unlock in {
                        for (@result <- unlock) {
                          @(*self, "CONTRACT_LOCK", contractId)!(Nil) |
                          @(*self, "BOX_LOCK", payload2.get("boxId"))!(Nil) |
                          @return2!(result)
                        } |
                        match payload2 {
                          {
                            "data": _,
                            "quantity": Int,
                            "id": String,
                            "price": Nil,
                            "boxId": String
                          } => {
                            getBoxCh!((payload2.get("boxId"), *ch1)) |
                            validateStringCh!((payload2.get("id"), *ch2)) |
                            for (@box <- ch1; @valid <- ch2) {
                              if (valid == true and box != Nil) {
                                for (
                                  _ <- @(*self, "CONTRACT_LOCK", contractId);
                                  _ <- @(*self, "BOX_LOCK", payload2.get("boxId"))
                                ) {
                                  proceedCreateCh!(Nil)
                                }
                              } else {
                                @return2!("error: invalid id or box not found")
                              }
                            }
                          }
                          _ => {
                            @return2!("error: invalid purse payload")
                          }
                        } |

                        // RACE SAFE / RESOURCES LOCKED
                        // after lock of 1 contract and 1 box
                        for (_ <- proceedCreateCh) {
                          blockData!(*ch3) |
                          for (_, @timestamp, _ <- ch3) {
                            makePurseCh!((
                              contractId,
                              payload2.delete("data").set("timestamp", timestamp),
                              payload2.get("data"),
                              true,
                              *ch4
                            )) |
                            for (@r <- ch4) {
                              match r {
                                String => { unlock!(r) }
                                (true, newPurse) => { unlock!(true) }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              } else {
                registerUnlock!("error: contract id already exists")
              }
            }
          }
        }
      } |

      for (@("CREDIT", payload, return) <= @boxCh) {
        new ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, proceedCreditCh, unlock in {
          for (@result <- unlock) {
            @(*self, "BOX_LOCK", boxId)!(Nil) |
            @(*self, "CONTRACT_LOCK", prefix ++ "rev")!(Nil) |
            @return!(result)
          } |
          match payload {
            { "purseRevAddr": String, "purseAuthKey": _ } => {
              for (
                _ <- @(*self, "BOX_LOCK", boxId);
                _ <- @(*self, "CONTRACT_LOCK", prefix ++ "rev")
              ) {
                proceedCreditCh!(Nil)
              }
            }
            _ => {
              @return!("error: invalid payload")
            }
          } |
          for (_ <- proceedCreditCh) {
            @RevVault!("findOrCreate", payload.get("purseRevAddr"), *ch2) |
            for (@a <- ch2) {
              match a {
                (true, emitterPurseVault) => {
                  @RevVault!("unforgeableAuthKey", *self, *ch3) |
                  revAddress!("fromUnforgeable", *self, *ch4) |
                  @emitterPurseVault!("balance", *ch6) |
                  for (@balance <- ch6; @escrowPurseAuthKey <- ch3; @escrowPurseRevAddr <- ch4) {
                    if (balance > 0) {
                      @RevVault!("findOrCreate", escrowPurseRevAddr, *ch5) |
                      for (@(true, escrowPurseVault) <- ch5) {
                        @emitterPurseVault!("transfer", escrowPurseRevAddr, balance, payload.get("purseAuthKey"), *ch7) |
                        for (@escrowTransferResult <- ch7) {
                          match escrowTransferResult {
                            (true, Nil) => {
                              blockData!(*ch9) |
                              for (_, @timestamp, _ <- ch9) {
                                makePurseCh!((
                                  prefix ++ "rev",
                                  {
                                    "quantity": balance,
                                    "boxId": boxId,
                                    "price": Nil,
                                    "timestamp": timestamp,
                                    "id": "auto"
                                  },
                                  Nil,
                                  true,
                                  *ch8
                                ))
                              } |
                              for (@r <- ch8) {
                                match r {
                                  String => { unlock!(r) }
                                  (true, newPurse) => { unlock!((true, Nil)) }
                                }
                              }
                            }
                            _ => {
                              unlock!("error: escrow transfer went wrong, invalid rev purse")
                            }
                          }
                        }
                      }
                    } else {
                      unlock!("error: balance is 0, cannot credit")
                    }
                  }
                }
                _ => {
                  unlock!("error: cannot find rev purse")
                }
              }
            }
          }
        }
      } |

      for (@("UPDATE_PURSE_PRICE", payload, return) <= @boxCh) {
        new ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, proceeedUpdateCh, unlock in {
          for (@result <- unlock) {
            @(*self, "BOX_LOCK", boxId)!(Nil) |
            @(*self, "CONTRACT_LOCK", payload.get("contractId"))!(Nil) |
            @return!(result)
          } |
          match payload {
            // FT (String, Int) (contractId, quantity)
            // NFT (String, String) (contractId, purseId)
            { "price": (String, Int) \\/ (String, String) \\/ Nil, "contractId": String, "purseId": String } => {
              for (_ <- ch8) {
                getContractPursesThmCh!((payload.get("contractId"), *ch4)) |
                for (@pursesThm <- ch4) {
                  if (pursesThm != Nil) {
                    for (
                      _ <- @(*self, "BOX_LOCK", boxId);
                      _ <- @(*self, "CONTRACT_LOCK", payload.get("contractId"))
                    ) {
                      proceeedUpdateCh!(Nil)
                    }
                  } else {
                    @return!("error: contract not found")
                  }
                }
              } |
              match payload.get("price") {
                (String, Int) => {
                  if (payload.get("price").nth(1) == 0) {
                    @return!("error: price cannot be zero")
                  } else {
                    ch8!(Nil)
                  }
                }
                _ => { ch8!(Nil) }
              }
            }
            _ => {
              @return!("error: invalid payload for update price")
            }
          } |

          // RACE SAFE / RESOURCES LOCKED
          // after lock of 1 contract and 1 box
          for (_ <- proceeedUpdateCh) {
            getBoxCh!((boxId, *ch7)) |
            for (@box <- ch7) {
              getPurseCh!((box, payload.get("contractId"), payload.get("purseId"), *ch5)) |
              for (@purse <- ch5) {
                if (purse != Nil) {
                  match (purse.get("id"), payload.get("price")) {
                    ("0", (String, String)) => {
                      unlock!("error: purse zero cannot be swapped with NFT")
                    }
                    (_, (String, "0")) => {
                      unlock!("error: you cannot ask for purse zero in exchange of swap")
                    }
                    _ => {
                      getContractPursesThmCh!((payload.get("contractId"), *ch1)) |
                      getContractPursesThmCh!((payload.get("price").nth(0), *ch2)) |
                      for (@pursesThm1 <- ch1; @pursesThm2 <- ch2) {
                        if (pursesThm1 != Nil and pursesThm2 != Nil) {
                          TreeHashMap!("set", pursesThm1, payload.get("purseId"), purse.set("price", payload.get("price")), *ch6) |
                          for (_ <- ch6) {
                            unlock!((true, Nil))
                          }
                        } else {
                          unlock!("error: one of the contracts not found")
                        }
                      }
                    }
                  }
                } else {
                  unlock!("error: purse not found")
                }
              }
            }
          }
        }
      } |

      for (@("UPDATE_PURSE_DATA", payload, return) <= @boxCh) {
        new ch1, ch2, ch3, ch4, proceeedUpdateCh, unlock in {
          for (@result <- unlock) {
            @(*self, "BOX_LOCK", boxId)!(Nil) |
            @(*self, "CONTRACT_LOCK", payload.get("contractId"))!(Nil) |
            @return!(result)
          } |
          match payload {
            { "data": _, "contractId": String, "purseId": String } => {
              getContractPursesThmCh!((payload.get("contractId"), *ch1)) |
              for (@pursesThm <- ch1) {
                if (pursesThm != Nil) {
                  for (
                    _ <- @(*self, "BOX_LOCK", boxId);
                    _ <- @(*self, "CONTRACT_LOCK", payload.get("contractId"))
                  ) {
                    proceeedUpdateCh!(Nil)
                  }
                } else {
                  @return!("error: contract not found")
                }
              }
            }
            _ => {
              @return!("error: invalid payload for update data")
            }
          } |

          // RACE SAFE / RESOURCES LOCKED
          // after lock of 1 contract and 1 box
          for (_ <- proceeedUpdateCh) {
            getBoxCh!((boxId, *ch3)) |
            for (@box <- ch3) {
              getPurseCh!((box, payload.get("contractId"), payload.get("purseId"), *ch4)) |
              for (@purse <- ch4) {
                if (purse != Nil) {
                  for (@pursesDataThm <<- @(*self, "pursesData", payload.get("contractId"))) {
                    TreeHashMap!("set", pursesDataThm, payload.get("purseId"), payload.get("data"), *ch2) |
                    for (_ <- ch2) {
                      unlock!((true, Nil))
                    }
                  }
                } else {
                  unlock!("error: purse not found")
                }
              }
            }
          }
        }
      } |

      for (@("RENEW", payload, return) <= @boxCh) {
        new ch1, ch2, ch3, ch4, renewStep2, ch20, renewStep3, ch33, ch34, ch35, ch36, ch37, ch38, proceeedRenewCh, unlock in {
          for (@result <- unlock) {
            @(*self, "BOX_LOCK", boxId)!(Nil) |
            @(*self, "CONTRACT_LOCK", payload.get("contractId"))!(Nil) |
            @return!(result)
          } |
          match payload {
            { "contractId": String, "purseId": String } => {
              getContractPursesThmCh!((payload.get("contractId"), *ch1)) |
              for (@pursesThm <- ch1) {
                if (pursesThm != Nil) {
                  for (
                    _ <- @(*self, "BOX_LOCK", boxId);
                    _ <- @(*self, "CONTRACT_LOCK", payload.get("contractId"))
                  ) {
                    proceeedRenewCh!(Nil)
                  }
                } else {
                  @return!("error: contract not found")
                }
              }
            }
            _ => {
              @return!("error: invalid payload for renew")
            }
          } |

          // RACE SAFE / RESOURCES LOCKED
          // after lock of 1 contract and 1 box
          for (_ <- proceeedRenewCh) {
            getBoxCh!((boxId, *ch1)) |
            for (@box <- ch1) {
              getContractPursesThmCh!((payload.get("contractId"), *ch2)) |
              getPurseCh!((box, payload.get("contractId"), payload.get("purseId"), *ch3)) |
              for (@pursesThm <- ch2) {
                TreeHashMap!("get", pursesThm, "0", *ch4) |
                for (@purse <- ch3; @purseZero <- ch4) {
                  for (@contractConfig <<- @(*self, "contractConfig", payload.get("contractId"))) {
                    match (contractConfig.get("expires"), contractConfig.get("fungible") == false, purse != Nil, purseZero != Nil, purse.get("boxId") == boxId) {
                      (Int, true, true, true, true) => {
                        renewStep2!((box, pursesThm, purseZero, purse, contractConfig.get("expires")))
                      }
                      _ => {
                        unlock!("error: purse 0 not found or contract is fungible=true")
                      }
                    }
                  }
                }
              }
            }
          } |

          for (@(box, pursesThm, purseZero, purse, expires) <- renewStep2) {
            blockData!(*ch20) |
            for (_, @timestamp, _ <- ch20) {
              match expires / 10 {
                grace => {
                  match purse.get("timestamp") + expires - grace {
                    startOfGracePeriod => {
                      if (timestamp > startOfGracePeriod) {
                        renewStep3!((box, pursesThm, purseZero, purse, expires))
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

          for (@(box, pursesThm, purseZero, purse, expires) <- renewStep3) {
            match purseZero.get("price") {
              (String, String) => { unlock!("error: purse zero not for sale with ft, cannot renew") }
              // renew is free
              Nil => {
                TreeHashMap!("set", pursesThm, purse.get("id"), purse.set("timestamp", purse.get("timestamp") + expires), *ch38) |
                for (_ <- ch38) { unlock!((true, Nil)) }
              }
              (String, Int) => {
                getPurseWithAtLeastQuantityCh!((box, purseZero.get("price").nth(0), purseZero.get("price").nth(1), *ch33)) |
                for (@purseForRenew <- ch33) {
                  if (purseForRenew != Nil) {
                    getContractPursesThmCh!((purseZero.get("price").nth(0), *ch36)) |
                    for (@feePursesThm <- ch36) {
                      if (purseForRenew.get("quantity") == purseZero.get("price").nth(1)) {
                        TreeHashMap!("set", feePursesThm, purseForRenew.get("id"), Nil, *ch34) |
                        removePurseInBoxCh!((purseForRenew.get("boxId"), purseZero.get("price").nth(0), purseForRenew.get("id"), *ch35))
                      } else {
                        TreeHashMap!("set", feePursesThm, purseForRenew.get("id"), purseForRenew.set("quantity", purseForRenew.get("quantity") - purseZero.get("price").nth(1)), *ch34) |
                        ch35!(Nil)
                      }
                    } |
                    for (_ <- ch34; _ <- ch35) {
                      TreeHashMap!("set", pursesThm, purse.get("id"), purse.set("timestamp", purse.get("timestamp") + expires), *ch38) |
                      for (_ <- ch38) {
                        unlock!((true, Nil)) |
                        // renew reward is here to avoid dead locks issues
                        // it will never wait eternally for same contractId or boxId lock
                        for (
                          _ <- @(*self, "CONTRACT_LOCK", purseZero.get("price").nth(0));
                          _ <- @(*self, "BOX_LOCK", purseZero.get("boxId"))
                        ) {
                          makePurseCh!((
                            purseZero.get("price").nth(0),
                            purseForRenew
                              .set("boxId", purseZero.get("boxId"))
                              .set("price", Nil)
                              .set("quantity", purseZero.get("price").nth(1)),
                            Nil,
                            true,
                            *ch37
                          )) |
                          for (_ <- ch37) {
                            @(*self, "CONTRACT_LOCK", purseZero.get("price").nth(0))!(Nil) |
                            @(*self, "BOX_LOCK", purseZero.get("boxId"))!(Nil)
                          }
                        }
                      }
                    }
                  } else {
                    unlock!("error: did not find purse for renew")
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
        new ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15, ch16, proceedChecksCh, proceedWithdrawCh, unlock in {
          for (@result <- unlock) {
            @return!(result) |
            @(*self, "CONTRACT_LOCK", payload.get("contractId"))!(Nil) |
            @(*self, "BOX_LOCK", boxId)!(Nil) |
            if (payload.get("toBoxId") != boxId) {
              @(*self, "BOX_LOCK", payload.get("toBoxId"))!(Nil)
            }
          } |

          // Step 1, make sure that contract exists
          // and box has purse
          // lock 1 contract and 1 (burn) or 2 (not burn) boxes
          match payload {
            { "quantity": Int, "contractId": String, "purseId": String, "toBoxId": String, "merge": Bool } => {

              getContractPursesThmCh!((payload.get("contractId"), *ch4)) |
              getBoxCh!((payload.get("toBoxId"), *ch6)) |

              for (@pursesThm <- ch4; @toBox <- ch6) {
                match (pursesThm != Nil, toBox != Nil) {
                  (true, true) => {
                    for (_ <- @(*self, "CONTRACT_LOCK", payload.get("contractId"))) {
                      for (_ <- @(*self, "BOX_LOCK", boxId)) {
                        if (payload.get("toBoxId") != boxId) {
                          for (_ <- @(*self, "BOX_LOCK", payload.get("toBoxId"))) {
                            proceedWithdrawCh!(Nil)
                          }
                        } else {
                          proceedWithdrawCh!(Nil)
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

          // RACE SAFE / RESOURCES LOCKED
          // after lock of 1 contract and 1 or 2 boxes
          for (_ <- proceedWithdrawCh) {
            getBoxCh!((boxId, *ch10)) |
            for (@box <- ch10) {
              getPurseCh!((box, payload.get("contractId"), payload.get("purseId"), *ch9)) |
              for (@purse <- ch9) {
                if (purse == Nil) {
                  unlock!("error: purse does not exist")
                } else {
                  if (purse.get("id") == "0") {
                    unlock!("error: withdraw from special nft 0 is forbidden")
                  } else {
                    for (@config <<- @(*self, "contractConfig", payload.get("contractId"))) {
                      if (payload.get("toBoxId") == "_rev" and payload.get("contractId") != prefix ++ "rev") {
                        unlock!("error: withdraw to _rev only allowed for wrapped rev")
                      } else if (payload.get("toBoxId") == "_burn") {
                        match config.get("expires") {
                          Int => { unlock!("error: cannot burn NFT that can expire") }
                          Nil => { ch15!((purse, box)) }
                        }
                      } else {
                        ch15!((purse, box))
                      }
                    }
                  }
                }
              }
            } |

            for (@(purse, box) <- ch15) {
              getContractPursesThmCh!((payload.get("contractId"), *ch16)) |
              for (@pursesThm <- ch16) {
                // the withdrawer should not be able to choose if
                // tokens in recipient box will or will not be 
                // merged, except if he withdraws to himself
                if (payload.get("toBoxId") != boxId) {
                  ch12!(true)
                } else {
                  ch12!(payload.get("merge"))
                } |

                /* appendLogCh!(
                  "w,\${contractId},\${toBox},\${fromBox},\${q}" %% {
                    "contractId": payload.get("contractId"),
                    "fromBox": boxId,
                    "toBox": payload.get("toBoxId"),
                    "q": payload.get("quantity"),
                  }
                ) | */
                for (@merge <- ch12) {
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
                        if (payload.get("toBoxId") == "_rev") {
                          for (@boxConfig <<- @(*self, "boxConfig", boxId)) {
                            creditBackCh!((boxConfig.get("revAddress"), payload.get("quantity"), *unlock))
                          }
                        } else {
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
                    }
                    // remove first purse, create a second purse
                    // associated with toBoxId
                    (true, true, false) => {
                      TreeHashMap!("set", pursesThm, payload.get("purseId"), Nil, *ch5) |
                      removePurseInBoxCh!((boxId, payload.get("contractId"), payload.get("purseId"), *ch8)) |
                      if (payload.get("toBoxId") == "_rev") {
                        for (@boxConfig <<- @(*self, "boxConfig", boxId)) {
                          creditBackCh!((boxConfig.get("revAddress"), payload.get("quantity"), *unlock))
                        }
                      } else {
                        for (_ <- ch5; _ <- ch8) {
                          for (@pursesDataThm <<- @(*self, "pursesData", payload.get("contractId"))) {
                            TreeHashMap!(
                              "get",
                              pursesDataThm,
                              payload.get("purseId"),
                              *ch7
                            ) |
                            for (@currentData <- ch7) {
                              TreeHashMap!(
                                "set",
                                pursesDataThm,
                                payload.get("purseId"),
                                Nil,
                                *ch11
                              ) |
                              for (_ <- ch11) {
                                makePurseCh!((
                                  payload.get("contractId"),
                                  purse
                                    .set("price", Nil)
                                    .set("boxId", payload.get("toBoxId")),
                                  currentData,
                                  merge,
                                  *unlock
                                ))
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
          }
        }
      } |

      for (@(amount, contractConfig, return2) <= calculateFeeCh) {
        if (contractConfig.get("fee") == Nil) {
          @return2!((amount, 0, Nil))
        } else {
          match amount * contractConfig.get("fee").nth(1) / 100000 {
            feeAmount => {
              new ch1 in {
                @return2!((amount - feeAmount, feeAmount, contractConfig.get("fee").nth(0)))
              }
            }
          }
        }
      } |

      for (@("SWAP", payload, return) <= @boxCh) {
        match payload {
          { "contractId": String, "purseId": String, "merge": Bool, "quantity": Int, "newId": Nil \\/ String } => {
            new ch2, ch3, ch4, ch5, ch6, ch7, ch9,
              step2Ch, ch20, ch21, ch22, ch23, ch24, ch25,
              step3aCh, step3bCh, ch30, ch31, ch32, ch33, ch34, ch35, ch36, ch37, ch38, ch39, ch40, ch41, ch42,
              removeOrAjustQuantityCh, unlock, lock in {
              // Lock 2 contracts or 1 (if SWAP is in same contract)
              // Lock 2 boxes or 1 (if SWAP is between same box)
              for (@(purseForSale, ret) <- lock) {
                new lockBoxes in {
                  for (_ <- @(*self, "CONTRACT_LOCK", payload.get("contractId"))) {
                    if (payload.get("contractId") != purseForSale.get("price").nth(0)) {
                      for (_ <- @(*self, "CONTRACT_LOCK", purseForSale.get("price").nth(0))) {
                        lockBoxes!(Nil)
                      }
                    } else {
                      lockBoxes!(Nil)
                    }
                  } |
                  for (_ <- lockBoxes) {
                    for (_ <- @(*self, "BOX_LOCK", boxId)) {
                      if (boxId != purseForSale.get("boxId")) {
                        for (_ <- @(*self, "BOX_LOCK", purseForSale.get("boxId"))) {
                          @ret!(Nil)
                        }
                      } else {
                        @ret!(Nil)
                      }
                    }
                  }
                }
              } |
              for (@(purseForSale, result) <- unlock) {
                @return!(result) |
                @(*self, "CONTRACT_LOCK", payload.get("contractId"))!(Nil) |
                if (payload.get("contractId") != purseForSale.get("price").nth(0)) {
                  @(*self, "CONTRACT_LOCK", purseForSale.get("price").nth(0))!(Nil)
                } |
                @(*self, "BOX_LOCK", boxId)!(Nil) |
                if (boxId != purseForSale.get("boxId")) {
                  @(*self, "BOX_LOCK", purseForSale.get("boxId"))!(Nil)
                }
              } |

              getBoxCh!((boxId, *ch3)) |
              getContractPursesThmCh!((payload.get("contractId"), *ch4)) |
              validateStringCh!((payload.get("newId"), *ch9)) |

              // Step 1, make sure that the two contracts exists
              // (seller purse and buyer purse)
              // lock 2 contracts and 2 boxes
              for (@box <- ch3; @pursesThm <- ch4; @valid <- ch9) {
                if (box != Nil and pursesThm != Nil and valid == true) {
                  TreeHashMap!("get", pursesThm, payload.get("purseId"), *ch6) |
                  for (@purseForSale <- ch6) {
                    if (purseForSale != Nil) {
                      match purseForSale.get("price") {
                        (String, Int) \\/ (String, String) => {
                          lock!((purseForSale, *step2Ch))
                        }
                        _ => {
                          @return!("error: purse not for sale")
                        }
                      }
                    } else {
                      @return!("error: purse not found")
                    }
                  }
                } else {
                  @return!("error: box or contract not found or invalid payload")
                }
              } |

              // RACE SAFE / RESOURCES LOCKED
              // after lock of 2 contracts and 2 boxes
              // Step 2
              // Find out if box can fulfill sell order
              for (_ <- step2Ch) {
                getBoxCh!((boxId, *ch23)) |
                getContractPursesThmCh!((payload.get("contractId"), *ch21)) |
                
                for (@pursesThm <- ch21; @box <- ch23) {
                  TreeHashMap!("get", pursesThm, payload.get("purseId"), *ch22) |
                  for (@purseForSale <- ch22) {
                    match purseForSale.get("price") {
                      Nil => {
                        unlock!((purseForSale, "error: no sell order found"))
                      }
                      _ => {
                        for (@contractConfig <<- @(*self, "contractConfig", purseForSale.get("price").nth(0))) {
                          match (purseForSale.get("price"), contractConfig.get("fungible")) {
                            // purseForSale is FT or NFT
                            // purseForSale asks FT in return
                            // seller's purse   <->   buyer's purse
                            // NFT or FT        <->   FT
                            ((String, Int), true) => {
                              if (payload.get("quantity") > purseForSale.get("quantity")) {
                                unlock!((purseForSale, "error: quantity not available"))
                              } else {
                                getPurseWithAtLeastQuantityCh!((box, purseForSale.get("price").nth(0), purseForSale.get("price").nth(1) * payload.get("quantity"), *ch20)) |
                                for (@purseForTransfer <- ch20) {
                                  if (purseForTransfer != Nil) {
                                    getContractPursesDataThmCh!((payload.get("contractId"), *ch24)) |
                                    for (@pursesDataThm <- ch24) {
                                      TreeHashMap!("get", pursesDataThm, purseForSale.get("id"), *ch25)
                                    } |
                                    for (@purseForSaleData <- ch25) {
                                      step3aCh!((box, pursesThm, purseForSale, purseForSaleData, contractConfig, purseForTransfer))
                                    }
                                  } else {
                                    unlock!((purseForSale, "error: box cannot fulfil order"))
                                  }
                                }
                              }
                            }
                            // purseForSale is FT or NFT
                            // purseForSale asks NFT in return
                            // seller's purse   <->   buyer's purse
                            // NFT or FT        <->   NFT
                            ((String, String), false) => {
                              if (box.get(purseForSale.get("price").nth(0)) != Nil) {
                                if (box.get(purseForSale.get("price").nth(0)).contains(purseForSale.get("price").nth(1)) == true) {
                                  getContractPursesThmCh!((purseForSale.get("price").nth(0), *ch21)) |
                                  for (@purseForTransferThm <- ch21) {
                                    TreeHashMap!("get", purseForTransferThm, purseForSale.get("price").nth(1), *ch20) |
                                    for (@purseForTransfer <- ch20) {
                                      getContractPursesDataThmCh!((payload.get("contractId"), *ch24)) |
                                      for (@pursesDataThm <- ch24) {
                                        TreeHashMap!("get", pursesDataThm, purseForTransfer.get("id"), *ch25)
                                      } |
                                      for (@purseForTransferData <- ch25) {
                                        step3bCh!((box, pursesThm, purseForSale, purseForTransferData, contractConfig, purseForTransfer))
                                      }
                                    }
                                  }
                                } else {
                                  unlock!((purseForSale, "error: box cannot fulfil order"))
                                }
                              } else {
                                unlock!((purseForSale, "error: box cannot fulfil order"))
                              }
                            }
                            _ => {
                              unlock!((purseForSale, "error: no sell order found"))
                            }
                          }
                        }
                      }
                    }
                  }
                }
              } |

              for (@(pursesThm, contractId, purse, quantity, return) <= removeOrAjustQuantityCh) {
                if (purse.get("quantity") == quantity) {
                  new removedFromBoxCh, purseRemovedCh, dataRemovedCh, tmpCh in {
                    TreeHashMap!("set", pursesThm, purse.get("id"), Nil, *purseRemovedCh) |
                    removePurseInBoxCh!((purse.get("boxId"), contractId, purse.get("id"), *removedFromBoxCh)) |
                    getContractPursesDataThmCh!((contractId, *tmpCh)) |
                    for (@pursesDataThm <- tmpCh) {
                      TreeHashMap!("set", pursesDataThm, purse.get("id"), Nil, *dataRemovedCh)
                    } |
                    for (_ <- removedFromBoxCh; _ <- purseRemovedCh; _ <- dataRemovedCh) { @return!(Nil) }
                  }
                } else {
                  TreeHashMap!("set", pursesThm, purse.get("id"), purse.set("quantity", purse.get("quantity") - quantity), return)
                }
              } |

              // Step 3 A
              // do transfer
              // Seller asks for FT
              // seller's purse   <->   buyer's purse
              // NFT or FT        <->   FT
              for (@(box, pursesThm, purseForSale, purseForSaleData, contractConfig, purseForTransfer) <- step3aCh) {

                // remove or ajust quantity in purseForSale
                removeOrAjustQuantityCh!((pursesThm, payload.get("contractId"), purseForSale, payload.get("quantity"), *ch30)) |
                
                // remove or ajust quantity in purseForTransfer
                getContractPursesThmCh!((purseForSale.get("price").nth(0), *ch32)) |
                for (@buyerPurseThm <- ch32) {
                  removeOrAjustQuantityCh!((buyerPurseThm, purseForSale.get("price").nth(0), purseForTransfer, payload.get("quantity") * purseForSale.get("price").nth(1), *ch31))
                } |

                for (@contractConfig <<- @(*self, "contractConfig", payload.get("contractId"))) {
                  calculateFeeCh!((payload.get("quantity") * purseForSale.get("price").nth(1), contractConfig, *ch39))
                } |

                for (_ <- ch30; _ <- ch31; @amountAndFeeAmount <- ch39) {
                  // create new purse for the buyer
                  makePurseCh!((
                    payload.get("contractId"),
                    // keep quantity of existing purse
                    purseForSale
                      .set("boxId", boxId)
                      .set("price", Nil)
                      .set("quantity", payload.get("quantity"))
                      // will only be considered for nft, purchase from purse "0"
                      .set("newId", payload.get("newId")),
                    purseForSaleData,
                    true,
                    *ch36
                  )) |
                  // create new purse for the seller
                  makePurseCh!((
                    purseForSale.get("price").nth(0),
                    purseForTransfer
                      .set("boxId", purseForSale.get("boxId"))
                      .set("quantity", amountAndFeeAmount.nth(0))
                      .set("price", Nil),
                    Nil,
                    true,
                    *ch40
                  )) |
                  for (@makeBuyerPurseResult <- ch36; _ <- ch40) {
                    match makeBuyerPurseResult {
                      String => {
                        unlock!((purseForSale, "error: CRITICAL could not make purse " ++ makeBuyerPurseResult))
                      }
                      (true, newPurse) => {
                        ch41!(Nil) |
                        unlock!((purseForSale, (true, Nil)))
                        
                        /* appendLogCh!(
                          "s,\${contractId},\${toBox},\${fromBox},\${q},\${p1},\${p2},\${p3},\${id},\${newId};" %% {
                            "contractId": payload.get("contractId"),
                            "fromBox": boxId,
                            "toBox": purseForSale.get("boxId"),
                            "q": payload.get("quantity"),
                            "p1": "ft",
                            "p2": purseForSale.get("price").nth(0),
                            "p3": purseForSale.get("price").nth(1),
                            "id": payload.get("purseId"),
                            "newId": newPurse.get("id")
                          }
                        ) */
                      }
                    } |
                    // fee reward is here to avoid dead locks issues
                    // it will never wait eternally for same contractId or boxId lock
                    for (_ <- ch41) {
                      if (amountAndFeeAmount.nth(1) > 0) {
                        for (
                          _ <- @(*self, "CONTRACT_LOCK", purseForSale.get("price").nth(0));
                          _ <- @(*self, "BOX_LOCK", amountAndFeeAmount.nth(2))
                        ) {
                          makePurseCh!((
                            purseForSale.get("price").nth(0),
                            purseForTransfer
                              .set("boxId", amountAndFeeAmount.nth(2))
                              .set("quantity", amountAndFeeAmount.nth(1))
                              .set("price", Nil),
                            Nil,
                            true,
                            *ch42
                          )) |
                          for (_ <- ch42) {
                            @(*self, "CONTRACT_LOCK", purseForSale.get("price").nth(0))!(Nil) |
                            @(*self, "BOX_LOCK", amountAndFeeAmount.nth(2))!(Nil)
                          }
                        }
                      }
                    }
                  }
                }
              } |

              // Step 3 B
              // do transfer
              // Seller asks for NFT
              // seller's purse   <->   buyer's purse
              // NFT or FT        <->   NFT
              for (@(box, pursesThm, purseForSale, purseForTransferData, contractConfig, purseForTransfer) <- step3bCh) {
                // a sell order for NFT is not per token
                // it is a full SWAP
                // remove completely seller's purse
                removeOrAjustQuantityCh!((pursesThm, payload.get("contractId"), purseForSale, purseForSale.get("quantity"), *ch30)) |
                
                // same for buyer's purse
                getContractPursesThmCh!((purseForSale.get("price").nth(0), *ch32)) |
                for (@buyerPurseThm <- ch32) {
                  removeOrAjustQuantityCh!((buyerPurseThm, purseForSale.get("price").nth(0), purseForTransfer, purseForTransfer.get("quantity"), *ch31))
                } |

                for (_ <- ch30; _ <- ch31) {
                  // create new purse for the buyer
                  makePurseCh!((
                    payload.get("contractId"),
                    purseForSale
                      .set("boxId", boxId)
                      .set("price", Nil),
                    Nil,
                    true,
                    *ch36
                  )) |
                  // create new purse for the seller
                  makePurseCh!((
                    purseForSale.get("price").nth(0),
                    purseForTransfer
                      .set("boxId", purseForSale.get("boxId"))
                      .set("price", Nil),
                    purseForTransferData,
                    true,
                    *ch38
                  )) |
                  for (@makeBuyerPurseResult <- ch36; @makeSellerPurseResult <- ch38) {
                    match makeBuyerPurseResult {
                      String => {
                        unlock!((purseForSale, "error: CRITICAL could not make purse " ++ makeBuyerPurseResult))
                      }
                      (true, newPurse) => {
                        unlock!((purseForSale, (true, Nil)))
                        /* appendLogCh!(
                          "s,\${contractId},\${toBox},\${fromBox},\${q},\${p1},\${p2},\${p3},\${id},\${newId};" %% {
                            "contractId": payload.get("contractId"),
                            "fromBox": boxId,
                            "toBox": purseForSale.get("boxId"),
                            "q": payload.get("quantity"),
                            "p1": "nft",
                            "p2": purseForSale.get("price").nth(0),
                            "p3": purseForSale.get("price").nth(1),
                            "newId": newPurse.get("id"),
                            "id": payload.get("purseId")
                          }
                        ) */
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

    // Register special box _rev
    new ch1 in {
      TreeHashMap!("set", boxesThm, "_rev", "exists", *ch1) |
      for (_ <- ch1) {
        @(*self, "boxes", "_rev")!({}) |
        @(*self, "boxesSuperKeys", "_rev")!(Set()) |
        @(*self, "boxConfig", "_rev")!({ "publicKey": "none", "revAddress": "none" }) |
        initLocksForBoxCh!("_rev") |
        stdout!("special box _rev registered, ready to receive wrapped rev")
      }
    } |

    // after a withdraw to _rev, this channel is called
    // and owner of box credited with true REV
    for (@(boxRevAddress, quantity, return) <= creditBackCh) {
      new ch1, ch2, ch3, ch4, ch5 in {
        @RevVault!("unforgeableAuthKey", *self, *ch3) |
        revAddress!("fromUnforgeable", *self, *ch4) |
        for (@escrowPurseAuthKey <- ch3; @escrowPurseRevAddr <- ch4) {
          @RevVault!("findOrCreate", escrowPurseRevAddr, *ch5) |
          for (@(true, escrowPurseVault) <- ch5) {
            @escrowPurseVault!("transfer", boxRevAddress, quantity, escrowPurseAuthKey, *ch1) |
            for (@escrowTransferResult <- ch1) {
              match escrowTransferResult {
                (true, Nil) => {
                  stdout!("\${quantity} wrapped rev burned and credited back to \${boxRevAddress}" %% { "quantity": quantity, "boxRevAddress": boxRevAddress }) |
                  @return!((true, Nil))
                }
                _ => { @return!("error CRITICAL: credit back went wrong") }
              }
            }
          }
        }
      }
    } |

    // Register special box _burn
    new ch1 in {
      TreeHashMap!("set", boxesThm, "_burn", "exists", *ch1) |
      for (_ <- ch1) {
        @(*self, "boxes", "_burn")!({}) |
        @(*self, "boxesSuperKeys", "_burn")!(Set()) |
        @(*self, "boxConfig", "_burn")!({ "publicKey": "none", "revAddress": "none" }) |
        initLocksForBoxCh!("_burn") |
        stdout!("special box _burn registered")
      }
    } |

    // Register special [prefix]rev fungible token
    new ch1, ch2, ch3, ch4 in {
      TreeHashMap!("init", ${payload.contractDepth || 2}, true, *ch2) |
      TreeHashMap!("init", ${payload.contractDepth || 2}, true, *ch4) |
      TreeHashMap!("set", contractsThm, prefix ++ "rev", "exists", *ch3) |
      for (@pursesThm <- ch2; @pursesDataThm <- ch4; _ <- ch3) {

        @(*self, "purses", prefix ++ "rev")!(pursesThm) |
        @(*self, "pursesData", prefix ++ "rev")!(pursesDataThm) |
        @(*self, "contractConfig", prefix ++ "rev")!(
          {
            "locked": true,
            "counter": 1,
            "version": "17.0.0",
            "fee": Nil,
            "expires": Nil,
            "contractId": prefix ++ "rev",
            "fungible": true
          }
        ) |
        @(*self, "CONTRACT_LOCK", prefix ++ "rev")!(Nil) |
        stdout!("special FT contract (wrapped rev) " ++ prefix ++ "rev registered")
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
    stdout!("rchain-token master registered at \${uri}" %% { "uri": *entryUri })
  }
}
`;
};
