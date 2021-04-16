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
    TreeHashMap!("set", thm2, "12", purse, *setReturnCh) |
  */
  pursesForSaleReadyCh,


  /*
    pursesData contains the data associated to purses
    for (data <- @(*pursesData, "12")) { ... }
  */
  pursesData,

  counterCh,
  TreeHashMap,

  insertArbitrary(\`rho:registry:insertArbitrary\`),
  stdout(\`rho:io:stdout\`),
  revAddress(\`rho:rev:address\`),
  registryLookup(\`rho:registry:lookup\`),
  deployerId(\`rho:rchain:deployerId\`)
in {

  counterCh!(0) |

  // reimplementation of TreeHashMap
// Modification (1): line 265, if Nil is sent over "set", wi remove the
// from map key instead of setting nil
// Modification (2): line 9, line 69 etc. base 12 instead of base 256
// Modification (3): "getAllValues" method that iterates and returns values
// this is from rchain/casper/src/main/resources/Registry.rho
new MakeNode, ByteArrayToNybbleList,
    TreeHashMapSetter, TreeHashMapGetter, TreeHashMapGetterValues, TreeHashMapContains, TreeHashMapUpdater, HowManyPrefixes, NybbleListForI,
    powersCh, storeToken, nodeGet in {
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

      contract TreeHashMap(@"init", @depth, ret) = {
        new map in {
          MakeNode!(0, (*map, [])) |
          @(*map, "depth")!!(depth) |
          ret!(*map)
        }
      } |

      contract TreeHashMapGetterValues(@map, @nybList, @n, @len, ret) = {
        // Look up the value of the node at (map, nybList.slice(0, n + 1))
        new valCh in {
          nodeGet!((map, nybList.slice(0, n)), *valCh) |
          for (@val <- valCh) {
            if (n == len) {
              ret!(val)
            } else {
              // Otherwise check if the rest of the path exists.
              // Bit k set means node k exists.
              // nybList.nth(n) is the node number
              // val & powers.nth(nybList.nth(n)) is nonzero if the node exists
              // (val / powers.nth(nybList.nth(n))) % 2 is 1 if the node exists
              if ((val / powers.nth(nybList.nth(n))) % 2 == 0) {
                ret!(Nil)
              } else {
                TreeHashMapGetterValues!(map, nybList, n + 1, len, *ret)
              }
            }
          }
        }
      } |

      contract TreeHashMapGetter(@map, @nybList, @n, @len, @suffix, ret) = {
        // Look up the value of the node at (map, nybList.slice(0, n + 1))
        new valCh in {
          nodeGet!((map, nybList.slice(0, n)), *valCh) |
          for (@val <- valCh) {
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
        }
      } |

      contract TreeHashMap(@"get", @map, @key, ret) = {
        new hashCh, nybListCh, keccak256Hash(\`rho:crypto:keccak256Hash\`) in {
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
  
      contract TreeHashMap(@"remove", @map, @key, ret) = {
        new hashCh, nybListCh, keccak256Hash(\`rho:crypto:keccak256Hash\`) in {
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

      contract TreeHashMap(@"getAllValues", @map, ret) = {
        new hashCh, resultCh, howManyPrefixesCh, iterateOnPrefixesCh, iterateOnKeysCh, nybListCh, keccak256Hash(\`rho:crypto:keccak256Hash\`) in {
          HowManyPrefixes!(map, *howManyPrefixesCh) |
          for (@depth <<- @(map, "depth")) {
            for (@howManyPrefixes <- howManyPrefixesCh ) {
              contract iterateOnKeysCh(@mmap, return) = {
                new itCh in {
                  for (@(i, keys, arr) <= itCh) {
                    match keys {
                      Set() => {
                        return!(arr)
                      }
                      Set(last) => {
                        return!(arr ++ [mmap.get(last)])
                      }
                      Set(first...rest) => {
                        itCh!((i + 1, rest, arr ++ [mmap.get(first)]))
                      }
                    }
                  } |
                  itCh!((0, mmap.keys(), []))
                }
              } |

              contract iterateOnPrefixesCh(return) = {
                new itCh in {
                  for (@(i, arr) <= itCh) {
                    match i <= howManyPrefixes - 1 {
                      false => {
                        return!(arr)
                      }
                      true => {
                        NybbleListForI!(map, i, depth, *nybListCh) |
                        for (@nybList <- nybListCh) {
                          new valuesCh, arrCh in {
                            TreeHashMapGetterValues!(map, nybList, 0,  depth, *valuesCh) |
                            for (@values <- valuesCh) {
                              // nothing found with this prefix
                              if (values == Nil) {
                                itCh!((i + 1, arr))
                              } else {
                                iterateOnKeysCh!(values, *arrCh) |
                                for (@a <- arrCh) {
                                  itCh!((i + 1, arr ++ a))
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  } |
                  itCh!((0, []))
                }
              } |

              iterateOnPrefixesCh!(*resultCh) |

              for (@allValues <- resultCh) {
                ret!(allValues)
              }
            }
          }
        }
      } |

      // Doesn't walk the path, just tries to fetch it directly.
      // Will hang if there's no key with that 64-bit prefix.
      // Returns Nil like "get" does if there is some other key with
      // the same prefix but no value there.
      contract TreeHashMap(@"fastUnsafeGet", @map, @key, ret) = {
        new hashCh, nybListCh, keccak256Hash(\`rho:crypto:keccak256Hash\`) in {
          // Hash the key to get a 256-bit array
          keccak256Hash!(key.toByteArray(), *hashCh) |
          for (@hash <- hashCh) {
            for(@depth <<- @(map, "depth")) {
              // Get the bit list
              ByteArrayToNybbleList!(hash, 0, depth, [], *nybListCh) |
              for (@nybList <- nybListCh) {
                new restCh, valCh in {
                  nodeGet!((map, nybList), *restCh) |
                  for (@rest <- restCh) {
                    ret!(rest.get(hash.slice(depth, 32)))
                  }
                }
              }
            }
          }
        }
      } |

      contract TreeHashMapSetter(@map, @nybList, @n, @len, @newVal, @suffix, ret) = {
        // Look up the value of the node at (map, nybList.slice(0, n + 1))
        new valCh, restCh in {
          match (map, nybList.slice(0, n)) {
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
                        MakeNode!(0, (map, nybList.slice(0, n + 1))) |
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
                        TreeHashMapSetter!(map, nybList, n + 1, len, newVal, suffix, *ret)
                      } else {
                        // Child node created between reads
                        // Release lock
                        @[node, *storeToken]!(val) |
                        // Loop
                        TreeHashMapSetter!(map, nybList, n + 1, len, newVal, suffix, *ret)
                      }
                    }
                  } else {
                    // Child node exists, loop
                    TreeHashMapSetter!(map, nybList, n + 1, len, newVal, suffix, *ret)
                  }
                }
              }
            }
          }
        }
      } |

      contract TreeHashMap(@"set", @map, @key, @newVal, ret) = {
        new hashCh, nybListCh, keccak256Hash(\`rho:crypto:keccak256Hash\`) in {
          // Hash the key to get a 256-bit array
          keccak256Hash!(key.toByteArray(), *hashCh) |
          for (@hash <- hashCh) {
            for (@depth <<- @(map, "depth")) {
              // Get the bit list
              ByteArrayToNybbleList!(hash, 0, depth, [], *nybListCh) |
              for (@nybList <- nybListCh) {
                TreeHashMapSetter!(map, nybList, 0,  depth, newVal, hash.slice(depth, 32), *ret)
              }
            }
          }
        }
      } |

      contract TreeHashMapContains(@map, @nybList, @n, @len, @suffix, ret) = {
        // Look up the value of the node at [map, nybList.slice(0, n + 1)]
        new valCh in {
          nodeGet!((map, nybList.slice(0, n)), *valCh) |
          for (@val <- valCh) {
            if (n == len) {
              ret!(val.contains(suffix))
            } else {
              // See getter for explanation of formula
              if ((val/powers.nth(nybList.nth(n))) % 2 == 0) {
                ret!(false)
              } else {
                TreeHashMapContains!(map, nybList, n + 1, len, suffix, *ret)
              }
            }
          }
        }
      } |

      contract TreeHashMap(@"contains", @map, @key, ret) = {
        new hashCh, nybListCh, keccak256Hash(\`rho:crypto:keccak256Hash\`) in {
          // Hash the key to get a 256-bit array
          keccak256Hash!(key.toByteArray(), *hashCh) |
          for (@hash <- hashCh) {
            for (@depth <<- @(map, "depth")) {
              // Get the bit list
              ByteArrayToNybbleList!(hash, 0, depth, [], *nybListCh) |
              for (@nybList <- nybListCh) {
                TreeHashMapContains!(map, nybList, 0,  depth, hash.slice(depth, 32), *ret)
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
                          @[node, *storeToken]!(val.set(suffix, newVal)) |
                          // Return
                          ret!(Nil)
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
              // Get the bit list
              ByteArrayToNybbleList!(hash, 0, depth, [], *nybListCh) |
              for (@nybList <- nybListCh) {
                TreeHashMapUpdater!(map, nybList, 0,  depth, *update, hash.slice(depth, 32), *ret)
              }
            }
          }
        }
      }
    }
  }
} |

  // depth 2 = 12 * 12 = 144 maps
  TreeHashMap!("init", ${payload.depth || 1}, *pursesReadyCh) |
  TreeHashMap!("init", ${payload.depth || 1}, *pursesForSaleReadyCh) |

  for (@thm <- pursesReadyCh; @thm2 <- pursesForSaleReadyCh) {
    /*
      makePurseCh
      only place where new purses are created
      "WITHDRAW", "PUBLIC_PURCHASE", "SWAP", "CREATE_PURSES" only call this channel

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
            TreeHashMap!("get", thm, properties.get("id"), *thmGetReturnCh) |
            for (@existingPurseProperties <- thmGetReturnCh) {
              if (existingPurseProperties == Nil) {
                idAndQuantityCh!({ "id": properties.get("id"), "quantity": properties.get("quantity") })
              } else {
                if (properties.get("id") == "0") {
                  TreeHashMap!("get", thm, properties.get("newId"), *thmGetReturn2Ch) |
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
              match (purseProperties, purseProperties.get("id").length() > 0, purseProperties.get("id").length() < 25) {
                ({
                  "quantity": Int,
                  // .box may is used to deploy other contracts
                  // and send purses to existing owners
                  "box": URI,
                  // .publicKey is used if purse is sold
                  "publicKey": String,
                  "type": String,
                  "id": String,
                  "price": Nil \\/ Int
                }, true, true) => {
                  new purse, setReturnCh in {
                    TreeHashMap!("set", thm, purseProperties.get("id"), purseProperties, *setReturnCh) |
                    for (_ <- setReturnCh) {

                      @(*pursesData, purseProperties.get("id"))!(data) |
                      @(*vault, *purse)!(purseProperties.get("id")) |

                      // todo if returns bundle+{*purse}, we can't iterate
                      // at line 627, why ???
                      @return!(*purse) |

                      /*
                        READ
                        Returns properties "id", "quantity", "type", "box" and "price"
                        (Nil) => propertie
                      */
                      for (@("READ", Nil, returnRead) <= purse) {
                        for (id <<- @(*vault, *purse)) {
                          TreeHashMap!("get", thm, *id, returnRead)
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
                                TreeHashMap!("get", thm, *id, *getReturnCh) |
                                for (properties <- getReturnCh) {
                                  if (*properties == Nil) {
                                    @returnSwap!("error: purse is worthless")
                                  } else {
                                    // todo remove key in treeHashMap instead of set Nil
                                    // not implemented in rnode yet
                                    TreeHashMap!("set", thm, *id, Nil, *setReturnCh) |
                                    TreeHashMap!("set", thm2, *id, Nil, *setForSaleReturnCh) |
                                    for (_ <- setReturnCh; _ <- setForSaleReturnCh; data <- @(*pursesData, *id)) {
                                      makePurseCh!((
                                        *properties
                                          .set("box", payload.get("box"))
                                          .set("publicKey", payload.get("publicKey")),
                                        *data,
                                        *makePurseReturnCh
                                      )) |
                                      for (newPurse <- makePurseReturnCh) {
                                        match *newPurse {
                                          String => {
                                            @returnSwap!("error: CRITICAL makePurse went wrong " ++ *newPurse)
                                          }
                                          _ => {
                                            stdout!(("purse.SWAP successful", *id)) |
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
                            TreeHashMap!("get", thm, *id, *getReturnCh) |
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
                                TreeHashMap!("get", thm, *id, *getReturnCh) |
                                for (properties <- getReturnCh) {
                                  if (*properties == Nil) {
                                    @returnSetPrice!("error: purse is worthless")
                                  } else {
                                    TreeHashMap!("set", thm, *id, *properties.set("price", payload), *setReturnCh) |
                                    for (_ <- setReturnCh) {
                                      stdout!(("purse.SET_PRICE successful", *id)) |
                                      match payload {
                                        Int => {
                                          TreeHashMap!("set", thm2, *id, *purse, *setForSaleReturnCh) |
                                          for (_ <- setForSaleReturnCh) {
                                            @returnSetPrice!((true, Nil))
                                          }
                                        }
                                        Nil => {
                                          TreeHashMap!("set", thm2, *id, Nil, *setForSaleReturnCh) |
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
                                TreeHashMap!("get", thm, *id, *getReturnCh) |
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
                                        TreeHashMap!("set", thm, properties.get("id"), properties.set("quantity", properties.get("quantity") - payload), *setReturnCh) |
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
                              TreeHashMap!("get", thm, *id, *getReturnCh) |
                              TreeHashMap!("get", thm, *depositedPurseId, *getReturn2Ch) |
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
                                    TreeHashMap!("set", thm, *depositedPurseId, Nil, *setReturnCh) |
                                    for (_ <- @(*vault, payload); _ <- @(*pursesData, *depositedPurseId); _ <- setReturnCh) {

                                      // set new quantity in purse
                                      TreeHashMap!("set", thm, *id, properties1.set(
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
                  @return!("error: invalid purse, id length must be between length 1 and 24")
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
              itCh!(payload.get("purses").keys()) |
              for(@set <= itCh) {
                match set {
                  Nil => {}
                  Set(last) => {
                    new retCh in {
                      makePurseCh!((payload.get("purses").get(last), payload.get("data").get(last), *retCh)) |
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
                      makePurseCh!((payload.get("purses").get(first), payload.get("data").get(first), *retCh)) |
                      for (purse <- retCh) {
                        match *purse {
                          String => {
                            @return!(*purse)
                          }
                          _ => {
                            for (createdPurses <- createdPursesesCh) {
                              createdPursesesCh!(*createdPurses ++ [*purse]) |
                              itCh!(rest)
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
                  TreeHashMap!("get", thm, last, *retCh) |
                  for (properties <- retCh) {
                    @return!(*tmp.set(last, *properties))
                  }
                }
              }
              Set(first ... rest) => {
                new retCh in {
                  TreeHashMap!("get", thm, first, *retCh) |
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

    for (@("PUBLIC_READ_ALL_PURSES", Nil, return) <= entryCh) {
      new getAllValuesCh in {
        TreeHashMap!("getAllValues", thm, *getAllValuesCh) |
        for (@allValues <- getAllValuesCh) {
          @return!(allValues)
        }
      }
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
        for (@keys <= itCh) {
          for (tmp <- tmpCh) {
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
                  tmpCh!(*tmp.union(Set(*id))) |
                  itCh!(rest)
                }
              }
            }
          }
        } |
        tmpCh!(Set()) |
        itCh!(payload)
      }
    } |


    for (@(amount, return) <= calculateFeeCh) {
      for (@current <<- mainCh) {
        if (current.get("fee") == Nil) {
          @return!((amount, 0))
        } else {
          match amount * current.get("fee").nth(1) / 100000 {
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
          new getReturnCh, revVaultCh, ownerRevAddressCh, purseVaultCh, calculateFeeReturnCh, performRefundCh, balanceCh in {

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

            TreeHashMap!("get", thm, payload.get("purseId"), *getReturnCh) |
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
                        @RevVault!("findOrCreate", from, *purseVaultCh) |
                        for (@(true, purseVault) <- purseVaultCh) {
                          @purseVault!("balance", *balanceCh) |
                          for (@balance <- balanceCh) {
                            if (balance == payload.get("quantity") * properties.get("price")) {
                              // ${payload.fee ? `["${payload.fee[0]}", ${payload.fee[1]}]` : "Nil"}
                              match feeAmount > 0 {
                                true => {
                                  new feeRevAddressCh, transferFeeReturnCh in {
                                    for (@current <<- mainCh) {
                                      revAddress!("fromPublicKey", current.get("fee").nth(0).hexToBytes(), *feeRevAddressCh) |
                                      for (@feeRevAddress <- feeRevAddressCh) {
                                        @purseVault!("transfer", feeRevAddress, feeAmount, payload.get("purseAuthKey"), *transferFeeReturnCh)
                                      } |
                                      for (@transferFeeReturn <- transferFeeReturnCh) {
                                        match transferFeeReturn {
                                          (true, Nil) => {
                                            stdout!("fee transfer successful")
                                          }
                                          _ => {
                                            stdout!("error: CRITICAL could not transfer fee")
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              } |
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
                                          TreeHashMap!("get", thm2, properties.get("id"), *getForSaleReturnCh) |
                                          for (purse <- getForSaleReturnCh) {
                                            stdout!(("buyer receives entire purse from seller", *purse)) |
                                            if (*purse == Nil) {
                                              performRefundCh!("error: CRITICAL purse was not found in pursesForSale")
                                            } else {
                                              @return!((true, *purse))

                                            }
                                          }
                                        }
                                        _ => {
                                          // change quantity of exiting purse
                                          TreeHashMap!("set", thm, properties.get("id"),
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
                                                  performRefundCh!("error: CRITICAL makePurse went wrong " ++ *newPurse)
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
                            } else {
                              performRefundCh!("error: balance of purse does not equal quantity * price")
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
      new boxDataCh, boxEntryCh, boxReturnCh in {
        registryLookup!(\`rho:id:${fromBoxRegistryUri}\`, *boxEntryCh) |
        for (boxEntry <- boxEntryCh) {
          boxEntry!(("PUBLIC_READ", Nil, *boxDataCh)) |
          for (r <- boxDataCh) {
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
                        "fee": ${payload.fee ? `["${payload.fee[0]}", ${payload.fee[1]}]` : "Nil"},
                        "registryUri": *entryUri,
                        "locked": false,
                        "fungible": ${payload.fungible},
                        "name": "${payload.name}",
                        "version": "5.0.2"
                      }) |
                      stdout!({
                        "status": "completed",
                        "fee": ${payload.fee ? `["${payload.fee[0]}", ${payload.fee[1]}]` : "Nil"},
                        "registryUri": *entryUri,
                        "locked": false,
                        "fungible": ${payload.fungible},
                        "name": "${payload.name}",
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
      }
      /*OUTPUT_CHANNEL*/
    }
  }
}
`;
};
