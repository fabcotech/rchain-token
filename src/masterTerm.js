module.exports.masterTerm = (payload) => {
    return `new 
  mainCh,

  entryCh,
  entryUriCh,
  iterateDataCh,
  byteArraySafeToStoreCh,
  iterateOnThmKeysCh,
  createPursesCh,
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
  boxesReadyCh,
  contractsReadyCh,

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
  savePurseInBoxCh,
  removePurseInBoxCh,

  insertArbitrary(\`rho:registry:insertArbitrary\`),
  stdout(\`rho:io:stdout\`),
  revAddress(\`rho:rev:address\`),
  registryLookup(\`rho:registry:lookup\`),
  deployerId(\`rho:rchain:deployerId\`)
in {

  counterCh!(0) |

  // reimplementation of TreeHashMap

/*
  Communications between channels have generally been reduced to reduce amount of
  serialization / deserialization

  when you "init" you can choose that the processes are also stored as bytes, instead of storing a map for each node, it stores a map at channel @map, and bytes at channel @(map, "bytes), this will make the "getAllValues" 10x, 20x, 30x faster depending on the process you are storing

  !!! make sure your processes do not contain the string "£$£$", or the bytes c2a324c2a324, those are used as delimiters
*/

new MakeNode, ByteArrayToNybbleList,
    TreeHashMapSetter, TreeHashMapSetterBytes, TreeHashMapGetter, TreeHashMapContains, TreeHashMapUpdater, HowManyPrefixes, NybbleListForI, RemoveBytesSectionIfExistsCh, keccak256Hash(\`rho:crypto:keccak256Hash\`),
    powersCh, storeToken, nodeGet in {
  match ([1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,655256], ["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"], 12, "£$£$£$£$".toByteArray().slice(4, 16), "£$£$£$£$".toByteArray().slice(4, 10)) {
    (powers, hexas, base, delimiter, insideDelimiter) => {
      contract MakeNode(@initVal, @node) = {
        @[node, *storeToken]!(initVal)
      } |


      /*
        delimiter between sections is £$£$£$£$ , length of delimiter is 12
        the hex representation of delimiter is c2a324c2a324c2a324c2a324
        "£$£$£$£$".toByteArray().slice(4, 16) == c2a324c2a324c2a324c2a324
        
        inside delimiter is £$£$ = c2a324c2a324

        The byte array has the following format (without bracket):
        c2a324c2a324c2a324c2a324[suffix]c2a324c2a324[value as byte array]c2a324c2a324c2a324c2a324[suffix2]c2a324c2a324[value 2 as byte array] etc.
      */
      contract RemoveBytesSectionIfExistsCh(@suffix, @ba, @ret) = {
        new itCh1, itCh2, removeSectionCh, indexesCh in {
          if (ba == Nil) {
            @ret!(Nil)
          } else {
            itCh1!(0) |
            indexesCh!([])
          } |
          for (@i <= itCh1) {
            if (ba.slice(i, i + 12) == delimiter) {
              if (i == ba.length() - 12) {
                for (@indexes <- indexesCh) {
                  removeSectionCh!(indexes ++ [i])
                }
              } else {
                for (@indexes <- indexesCh) {
                  indexesCh!(indexes ++ [i]) |
                  itCh1!(i + 1)
                }
              }
            } else {
              if (i == ba.length() - 12) {
                for (@indexes <- indexesCh) {
                  removeSectionCh!(indexes)
                }
              } else {
                itCh1!(i + 1)
              }
            }
          } |
          for (@indexes <- removeSectionCh) {
            for (@i <= itCh2) {
              // check if there is an index for i
              if (indexes.length() == i) {
                @ret!(ba)
              } else {
                if (ba.length() > indexes.nth(i) + suffix.length() + 12) {
                  if (ba.slice(indexes.nth(i) + 12, indexes.nth(i) + 12 + suffix.length()) == suffix) {
                    if (indexes.length() - 1 == i) {
                      // only one entry in ba, cannot slice(0,0), send Nil
                      if (indexes.length() > 1) {
                        @ret!(ba.slice(0, indexes.nth(i)))
                      } else {
                        @ret!(Nil)
                      }
                    } else {
                      @ret!(ba.slice(0, indexes.nth(i)) ++ ba.slice(indexes.nth(i + 1), ba.length()))
                    }
                  } else {
                    itCh2!(i + 1)
                  }
                } else {
                  @ret!(ba)
                }
              }
            } |
            itCh2!(0)
          }
        }
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
  
      contract TreeHashMap(@"remove", @map, @key, ret) = {
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

      contract TreeHashMap(@"getAllValues", @map, ret) = {
        new hashCh, resultCh, howManyPrefixesCh, iterateOnPrefixesCh, nybListCh in {
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

      // Doesn't walk the path, just tries to fetch it directly.
      // Will hang if there's no key with that 64-bit prefix.
      // Returns Nil like "get" does if there is some other key with
      // the same prefix but no value there.
      contract TreeHashMap(@"fastUnsafeGet", @map, @key, ret) = {
        new hashCh, nybListCh in {
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

      contract TreeHashMapSetterBytes(@channel, @nybList, @n, @len, @newVal, @suffix, ret) = {
        // channel is either map or (map, "bytes")
        // Look up the value of the node at (channel, nybList.slice(0, n + 1))
        new valCh, restCh, retRemoveCh in {
          match (channel, nybList.slice(0, n)) {
            node => {
              for (@val <<- @[node, *storeToken]) {
                if (n == len) {
                  // Acquire the lock on this node
                  for (@val <- @[node, *storeToken]) {
                    // If we're at the end of the path, set the node to newVal.
                    if (val == 0) {
                      // Release the lock
                      @[node, *storeToken]!(delimiter ++ suffix ++ insideDelimiter ++ newVal.toByteArray()) |
                      // Return
                      ret!(Nil)
                    }
                    else {
                      // Release the lock
                      if (newVal == Nil) {
                        RemoveBytesSectionIfExistsCh!(suffix, val, *retRemoveCh) |
                        for (@bytes <- retRemoveCh) {
                          @[node, *storeToken]!(bytes) |
                          ret!(Nil)
                        }
                        // Return
                      } else {
                        RemoveBytesSectionIfExistsCh!(suffix, val, *retRemoveCh) |
                        for (@bytes <- retRemoveCh) {
                          // check if empty
                          if (bytes == Nil) {
                            @[node, *storeToken]!(delimiter ++ suffix ++ insideDelimiter ++ newVal.toByteArray()) |
                            ret!(Nil)
                          } else {
                            @[node, *storeToken]!(bytes ++ delimiter ++ suffix ++ insideDelimiter ++ newVal.toByteArray()) |
                            ret!(Nil)
                          }
                        }
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
                        TreeHashMapSetterBytes!(channel, nybList, n + 1, len, newVal, suffix, *ret)
                      } else {
                        // Child node created between reads
                        // Release lock
                        @[node, *storeToken]!(val) |
                        // Loop
                        TreeHashMapSetterBytes!(channel, nybList, n + 1, len, newVal, suffix, *ret)
                      }
                    }
                  } else {
                    // Child node exists, loop
                    TreeHashMapSetterBytes!(channel, nybList, n + 1, len, newVal, suffix, *ret)
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
                        // store-as-bytes-map
                        TreeHashMapSetter!((map, "bytes"), nybList, 0,  depth, Nil, hash.slice(depth, 32), *ret2)
                        // store-as-bytes-array
                        /* TreeHashMapSetterBytes!((map, "bytes"), nybList, 0,  depth, Nil, hash.slice(depth, 32), *ret2) */
                      } else {
                        // store-as-bytes-map
                        TreeHashMapSetter!((map, "bytes"), nybList, 0,  depth, newVal.toByteArray(), hash.slice(depth, 32), *ret2)
                        // store-as-bytes-array
                        /* TreeHashMapSetterBytes!((map, "bytes"), nybList, 0,  depth, newVal, hash.slice(depth, 32), *ret2) */
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
        new hashCh, nybListCh in {
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
        new hashCh, nybListCh in {
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
  TreeHashMap!("init", ${payload.depth || 3}, true, *boxesReadyCh) |
  TreeHashMap!("init", ${payload.depth || 3}, false, *contractsReadyCh) |

  /* forbidden characters are used as delimiters in
  tree hash map, this method checks they are not aprt
  of a byte array */
  // store-as-bytes-array
  /* for (@(ba, ret) <= byteArraySafeToStoreCh) {
    new itCh1, itCh2, removeSectionCh, indexesCh in {
      itCh1!(0) |
      indexesCh!([]) |
      for (@i <= itCh1) {
        if (ba.slice(i, i + 6) == "£$£$£$£$".toByteArray().slice(4, 10)) {
          @ret!(false)
        } else {
          if (i == ba.length() - 6) {
            @ret!(true)
          } else {
            itCh1!(i + 1)
          }
        }
      }
    }
  } | */


  for (@boxesThm <- boxesReadyCh; @contractsThm <- contractsReadyCh) {

    for (@(contractId, boxId, purseId, return) <= removePurseInBoxCh) {
      new ch1, ch2 in {
        TreeHashMap!("get", boxesThm, boxId, *ch1) |
        for (@exists <- ch1) {
          if (exists == "exists") {
            for (@box <<- @(*vault, "boxes", boxId)) {
              if (box.get(contractId) == Nil) {
                @return!("error: purse not found")
              } else {
                if (box.get(contractId).contains(purseId) == false) {
                  @return!("error: purse not found")
                } else {
                  for (_ <- @(*vault, "boxes", boxId)) {
                    @(*vault, "boxes", boxId)!(box.set(contractId, box.get(contractId).delete(purseId)))
                  }
                }
              }
            }
          } else {
            @return!("error: purse not found")
          }
        }
      }
    } |

    for (@(contractId, boxId, purseId, return) <= savePurseInBoxCh) {
      new ch1, ch2 in {
        TreeHashMap!("get", boxesThm, boxId, *ch1) |
        for (@exists <- ch1) {
          if (exists == Nil) {
            @return!("error: box does not exist")
          } else {
            for (@box <- @(*vault, "boxes", boxId)) {
              if (box.get(contractId) == Nil) {
                @(*vault, "boxes", boxId)!(box.set(contractId, Set(purseId))) |
                @return!((true, Nil))
              } else {
                if (box.get(contractId).contains(purseId) == false) {
                  @(*vault, "boxes", boxId)!(box.set(
                    contractId,
                    box.get(contractId).union(Set(purseId))
                  )) |
                  @return!((true, Nil))
                } else {
                  @return!("error: CRITICAL, purse already exists in box") |
                  @(*vault, "boxes", boxId)!(box)
                }
              }
            }
          }
        }
      }
    } |

    /*
      makePurseCh
      only place where new purses are created
      "WITHDRAW", "PUBLIC_PURCHASE", "SWAP", "CREATE_PURSES" only call this channel

      depending on if .fungible is true or false, it decides
      which id to give to the new purse, then it creates
      the purse with SWAP, UPDATE_DATA, SET_PRICE, WITHDRAW, DEPOSIT instance methods
    */
    for (@(contractId, boxId, properties, data, return) <= makePurseCh) {
      new idAndQuantityCh, safeStringCh, thmGetReturnCh, thmGetReturn2Ch, thmGetReturn3Ch in {
        for (@config <<- @(*vault, "contractConfig", contractId)) {
          if (config.get("fungible") == true) {
            for (_ <- @(*vault, "contractConfig", contractId)) {
              @(*vault, "contractConfig", contractId)!(config.set("counter", config.get("counter") + 1))
            } |
            idAndQuantityCh!({ "id": "\${n}" %% { "n": config.get("counter") }, "quantity": properties.get("quantity") })
          } else {
            for (@pursesThm <<- @(*vault, "purses", contractId)) {
              TreeHashMap!("get", pursesThm, properties.get("id"), *thmGetReturnCh) |
              for (@existingPurseProperties <- thmGetReturnCh) {

                // check that nft does not exist
                if (existingPurseProperties == Nil) {
                  idAndQuantityCh!({ "id": properties.get("id"), "quantity": properties.get("quantity") })
                } else {

                  // nft with id: "0" is a special nft from which
                  // anyone can mint a nft that does not exist yet
                  // used by dappy name system for example
                  if (properties.get("id") == "0") {
                    TreeHashMap!("get", pursesThm, properties.get("newId"), *thmGetReturn2Ch) |
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
            purseProperties => {
              match (purseProperties, purseProperties.get("id").length() > 0, purseProperties.get("id").length() < 25) {
                ({
                  "quantity": Int,
                  "type": String,
                  "id": String,
                  "price": Nil \\/ Int
                }, true, true) => {
                  new setReturnCh, setReturn2Ch, savePurseReturnCh  in {
                    for (@pursesDataThm <<- @(*vault, "pursesData", contractId)) {
                      for (@pursesThm <<- @(*vault, "purses", contractId)) {
                        TreeHashMap!("set", pursesThm, purseProperties.get("id"), purseProperties, *setReturnCh) |
                        TreeHashMap!("set", pursesDataThm, purseProperties.get("id"), data, *setReturn2Ch)
                      }
                    } |

                    for (_ <- setReturnCh; _ <- setReturn2Ch) {
                      savePurseInBoxCh!((contractId, boxId, purseProperties.get("id"), *savePurseReturnCh)) |
                      for (@r <- savePurseReturnCh) {
                        match r {
                          String => {
                            @return!(r)
                          }
                          _ => {
                            @return!((true, purseProperties.get("id")))
                          }
                        }
                      }
                    }
                  }
                }
                _ => {
                  @return!("error: invalid purse, one of the following errors: id length must be between length 1 and 24, id/type must not contain characters £$£$")
                }
              }
            }
          }
        }
      }
    } |

    for (@(payload, contractId, return) <= createPursesCh) {
      new itCh, sizeCh, createdPursesesCh, saveKeyAndBagCh in {
        createdPursesesCh!([]) |
        sizeCh!(payload.get("purses").keys().size()) |
        for (@size <- sizeCh) {
          itCh!(payload.get("purses").keys()) |
          for(@set <= itCh) {
            match set {
              Nil => {}
              Set(last) => {
                new retCh in {
                  match payload.get("purses").get(last) {
                    {
                      "quantity": Int,
                      "type": String,
                      "id": String,
                      "price": Nil \\/ Int,
                      "boxId": String
                    } => {
                      makePurseCh!((
                        contractId,
                        payload.get("purses").get(last).get("boxId"),
                        payload.get("purses").get(last).delete("boxId"),
                        payload.get("data").get(last),
                        *retCh
                      )) |
                      for (@r <- retCh) {
                        match r {
                          String => {
                            @return!("error: some purses may have been created until one failed " ++ r)
                          }
                          _ => {
                            @return!((true, Nil))
                          }
                        }
                      }
                    }
                    _ => {
                      @return!("error: invalid purse payload, some purses may have been successfuly created")
                    }
                  }
                }
              }
              Set(first ... rest) => {
                new retCh in {
                  match payload.get("purses").get(first) {
                    {
                      "quantity": Int,
                      "type": String,
                      "id": String,
                      "price": Nil \\/ Int,
                      "boxId": String
                    } => {
                      makePurseCh!((
                        contractId,
                        payload.get("purses").get(first).get("boxId"),
                        payload.get("purses").get(first).delete("boxId"),
                        payload.get("data").get(first),
                        *retCh
                      )) |
                      for (@r <- retCh) {
                        match r {
                          String => {
                            @return!("error: some purses may have been created until one failed " ++ r)
                          }
                          _ => {
                            itCh!(rest) |
                            @return!((true, Nil))
                          }
                        }
                      }
                    }
                    _ => {
                      @return!("error: invalid purse payload, some purses may have been successfuly created")
                    }
                  }
                }
              }
            }
          }
        }
      }
    } |

    contract iterateOnThmKeysCh(@(ids, thm, return)) = {
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

    for (@("PUBLIC_READ_ALL_PURSES", contractId, return) <= entryCh) {
      new ch1, ch2 in {
        TreeHashMap!("get", contractsThm, contractId, *ch1) |
        for (@exists <- ch1) {
          if (exists == "exists") {
            for (@pursesThm <- @(*vault, "purses", contractId)) {
              TreeHashMap!("getAllValues", pursesThm, *ch2) |
              for (@allValues <- ch2) {
                @return!(allValues)
              }
            }
          } else {
            @return!("error: contract not found")
          }
        }
      }
    } |

    for (@("PUBLIC_READ_BOX", boxId, return) <= entryCh) {
      new ch1, ch2 in {
        TreeHashMap!("get", boxesThm, boxId, *ch1) |
        for (@exists <- ch1) {
          if (exists == "exists") {
            for (@box <<- @(*vault, "boxes", boxId)) {
              for (@superKeys <<- @(*vault, "boxesSuperKeys", boxId)) {
                for (@config <<- @(*vault, "boxConfig", boxId)) {
                  @return!(config.union({ "superKeys": superKeys, "purses": box }))
                }
              }
            }
          } else {
            @return!("error: box not found")
          }
        }
      }
    } |

    for (@("PUBLIC_READ_PURSES", payload, return) <= entryCh) {
      new ch1, ch2 in {
        TreeHashMap!("get", contractsThm, payload.get("contractId"), *ch1) |
        for (@exists <- ch1) {
          if (exists == "exists") {
            match payload.get("purseIds").size() < 101 {
              true => {
                for (@pursesThm <<- @(*vault, "purses", payload.get("contractId"))) {
                  iterateOnThmKeysCh!((payload.get("purseIds"), pursesThm, return))
                }
              }
              _ => {
                @return!("error: payload.purseIds must be a Set of strings with max size 100")
              }
            }
          } else {
            @return!("error: contract not found")
          }
        }
      }
    } |

    for (@("PUBLIC_READ_PURSES_DATA", payload, return) <= entryCh) {
      new ch1, ch2 in {
        TreeHashMap!("get", contractsThm, payload.get("contractId"), *ch1) |
        for (@exists <- ch1) {
          if (exists == "exists") {
            match payload.get("purseIds").size() < 101 {
              true => {
                for (@pursesDataThm <<- @(*vault, "pursesData", payload.get("contractId"))) {
                  iterateOnThmKeysCh!((payload.get("purseIds"), pursesDataThm, return))
                }
              }
              _ => {
                @return!("error: payload.purseIds must be a Set of strings with max size 100")
              }
            }
          } else {
            @return!("error: contract not found")
          }
        }
      }
    } |

    for (@("PUBLIC_REGISTER_BOX", payload, return) <= entryCh) {
      match (payload.get("boxId"), payload.get("publicKey"), payload.get("boxId").length() > 1, payload.get("boxId").length() < 25) {
        (String, String, true, true) => {
          new ch1, ch2 in {
            TreeHashMap!("get", boxesThm, payload.get("boxId"), *ch1) |
            for (@existingBox <- ch1) {
              if (existingBox == Nil) {
                new box in {
                  TreeHashMap!("set", boxesThm, payload.get("boxId"), "exists", *ch2) |
                  for (_ <- ch2) {
                    @(*vault, "boxes", payload.get("boxId"))!({}) |
                    @(*vault, "boxesSuperKeys", payload.get("boxId"))!(Set()) |
                    @(*vault, "boxConfig", payload.get("boxId"))!({ "publicKey": payload.get("publicKey") }) |
                    @return!((true, bundle+{*box}))
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

    for (@("PUBLIC_REGISTER_CONTRACT", payload, return) <= entryCh) {
      match payload {
        { "contractId": String, "boxId": String, "fungible": Bool, "fee": Nil \\/ (String, Int) } => {
          match (payload.get("contractId").length() > 1, payload.get("contractId").length() < 25) {
            (true, true) => {
              new ch1, ch2, ch3, ch4, ch5 in {
                TreeHashMap!("get", contractsThm, payload.get("contractId"), *ch1) |
                TreeHashMap!("get", boxesThm, payload.get("boxId"), *ch5) |
                for (@existingContract <- ch1; @existingBox <- ch5) {
                  if (existingContract == Nil) {
                    if (existingBox == "exists") {
                      TreeHashMap!("init", ${payload.contractDepth || 2}, true, *ch2) |
                      TreeHashMap!("init", ${payload.contractDepth || 2}, true, *ch4) |
                      TreeHashMap!("set", contractsThm, payload.get("contractId"), "exists", *ch3) |
                      for (@pursesThm <- ch2; @pursesDataThm <- ch4; _ <- ch3) {

                        for (@superKeys <- @(*vault, "boxesSuperKeys", payload.get("boxId"))) {
                          @(*vault, "boxesSuperKeys", payload.get("boxId"))!(
                            superKeys.union(Set(payload.get("contractId")))
                          )
                        } |

                        // purses tree hash map
                        @(*vault, "purses", payload.get("contractId"))!(pursesThm) |

                        // purses data tree hash map
                        @(*vault, "pursesData", payload.get("contractId"))!(pursesDataThm) |

                        // config
                        @(*vault, "contractConfig", payload.get("contractId"))!(
                          payload.set("locked", false).set("counter", 0).set("version", "6.0.0")
                        ) |

                        new superKey in {
                          // return the super key
                          @return!((true, bundle+{*superKey})) |

                          for (@("LOCK", lockReturnCh) <= superKey) {
                            for (@config <<- @(*vault, "contractConfig", payload.get("contractId"))) {
                              if (config.get("locked") == true) {
                                @lockReturnCh!("error: contract is already locked")
                              } else {
                                for (_ <- @(*vault, "contractConfig", payload.get("contractId"))) {
                                  @(*vault, "contractConfig", payload.get("contractId"))!(config.set("locked", true)) |
                                  @lockReturnCh!((true, Nil))
                                }
                              }
                            }
                          } |
                          for (@("CREATE_PURSES", createPursesPayload, createPursesReturnCh) <= superKey) {
                            stdout!("CREATE_PURSES") |
                            for (@config <<- @(*vault, "contractConfig", payload.get("contractId"))) {
                              if (config.get("locked") == true) {
                                @createPursesReturnCh!("error: contract is locked")
                              } else {
                                createPursesCh!((createPursesPayload, payload.get("contractId"), createPursesReturnCh))
                              }
                            }
                          }
                        }
                      }
                    } else {
                      @return!("error: box not found")
                    }
                  } else {
                    @return!("error: contract id already exists")
                  }
                }
              }
            }
            _ => {
              @return!("error: invalid contract id")
            }
          }
        }
        _ => {
          @return!("error: invalid payload")
        }
      }
    } |

    insertArbitrary!(bundle+{*entryCh}, *entryUriCh) |

    for (entryUri <- entryUriCh) {
      mainCh!({
        "status": "completed",
        "registryUri": *entryUri
      }) |
      stdout!(("rchain-token master registered at", *entryUri))
    }
  }
}
`;
};
