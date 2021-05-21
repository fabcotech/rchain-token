deploy time calculation, time elapsed between "PreCharging" is printed on screen, and the 200 names (result from PUBLIC_READ_ALL_PURSES) is printed.

Command to execute:

```
rnode deploy --phlo-price 1 --phlo-limit 1000000000 --valid-after-block-number x --private-key x ./rholang/read_all_purses.rho
```

##### Results:

Local deploy, around 200 names depth = 1
PUBLIC_READ_ALL_PURSES 200 names (deploy 1) = 20s
PUBLIC_READ_ALL_PURSES 200 names (deploy 2) = 20s

Local deploy, around 100 names depth = 2
PUBLIC_READ_ALL_PURSES 100 names (deploy 1) = 45s
PUBLIC_READ_ALL_PURSES 100 names (deploy 2) = 45s

Local deploy, around 200 names depth = 2
PUBLIC_READ_ALL_PURSES 200 names (deploy 1) = 84s
PUBLIC_READ_ALL_PURSES 200 names (deploy 2) = 86s

{ id: 1, quantity: 130, type: "gold", box: "aa", publicKey:"aaaaaaaaaaaaadd" }

{ id: 1, quantity: 130, type: "gold", box: "aa", publicKey:"aaaaaaaaaaaaadd" }.toByteArray()

[255, 12, 12, 1, 120]

Local deploy, around 400 names depth = 2
PUBLIC_READ_ALL_PURSES 100 names (deploy 1) = 142s

Local deploy, around 594 names depth = 2
PUBLIC_READ_ALL_PURSES 100 names (deploy 1) = 243s

**2021-04-19 release 5.0.3 (not fixed)**

Local deploy, 20 names depth = 1
PUBLIC_READ_ALL_PURSES 20 names = 2.22s

Local deploy, 20 names depth = 2
PUBLIC_READ_ALL_PURSES 20 names = 13.9s

Local deploy, 60 names depth = 1
PUBLIC_READ_ALL_PURSES 60 names = 5.24s

Local deploy, 60 names depth = 2
PUBLIC_READ_ALL_PURSES 60 names = 26.63s

**Improvement 1: New code in tree_hash_map.rho that does not iterate over keys of map to send value, but rather does allMap.union(map) directly. See around line 204 in tree_hash_map.rho**

Local deploy, 20 names depth = 1
PUBLIC_READ_ALL_PURSES 20 names = 1.34s

Local deploy, 20 names depth = 2
PUBLIC_READ_ALL_PURSES 60 names = 9.56s

Local deploy, 60 names depth = 1
PUBLIC_READ_ALL_PURSES 60 names = 2.8s

Local deploy, 60 names depth = 2
PUBLIC_READ_ALL_PURSES 60 names = 12.35s

**Imrovement 2: don't use nodeGet channel in TreeHashMapGetterValues (and in TreeHashMapGetter) to avoid one round of serialization / deserialization for each map (144 or 12 times)**

Local deploy, 20 names depth = 1
PUBLIC_READ_ALL_PURSES 20 names = 1.4s

Local deploy, 60 names depth = 2
PUBLIC_READ_ALL_PURSES 60 names = 11.949s

**Improvement 3: put TreeHashMapGetterValues close to itCh loop to reduce comm events again**

Local deploy, 60 names depth = 2
PUBLIC_READ_ALL_PURSES 60 names = 9.0s

Local deploy, 120 names depth = 2
PUBLIC_READ_ALL_PURSES 120 names = 20.0s

Local deploy, 200 names depth = 2
PUBLIC_READ_ALL_PURSES 120 names = 41.5s

**2021-04-20 Now doing tests on a blank tree hash map, no rchain-token involved**
**See stress/stress_thm.js**

We will create tree hash map with 200 entries, depth 1 or 12 (12 maps or 144 maps), and the value will be 1, 2 or 3 (see stress/stress_thm.js to know what values 1 2 3 are). We will see if the size and nature (Map or String) of the process being stored impacts the "getAllValues" time.

Local deploy, 200 values (1) depth = 2
PUBLIC_READ_ALL_PURSES 200 values = 10.914

Local deploy, 200 values (2) depth = 2
PUBLIC_READ_ALL_PURSES 200 values = 11.363

Local deploy, 200 values (3) depth = 2
PUBLIC_READ_ALL_PURSES 200 values = 40s

Testing with blake2b256 instead of keccak256

Local deploy, 200 values (3) depth = 2 phlo/dust = 5605188
PUBLIC_READ_ALL_PURSES 200 values = 39s

Local deploy, 200 values (3) depth = 2 pĥlo/dust = 5536578
PUBLIC_READ_ALL_PURSES 200 values = 39s

No effect, back to keccak

Local deploy, 200 values (1) depth = 2 phlo/dust = 4676733
PUBLIC_READ_ALL_PURSES 200 values = 11.3s

Local deploy, 200 values (2) depth = 2 phlo/dust = 11322433
PUBLIC_READ_ALL_PURSES 200 values = 11.45s

Local deploy, 200 values (3) depth = 2 phlo/dust = 5530078
PUBLIC_READ_ALL_PURSES 200 values = 39s

With the map (3), time to read is around 4x superior.

**Storing as byte array `newVal.toByteArray()` instead of storing the process whatever kind it is (Map, String etc.)**

Local deploy, 200 values (3) as byte array depth = 2 phlo/dust = 5530078
PUBLIC_READ_ALL_PURSES 200 values = 11.3s

Great ! So even value (3) can be recovered as quick as value 1 and 2, it just has to be stored as byte array

**2021-04-21**

Tree hash map can also store process as bytes, the hard work of deserialisation etc. is done in javascript off-chain

Very good results !!!

"getAllValues", sends back the bytes directly, in the following format:

```
{
    // hash of the key : byte array
    "abbcbcdbbabbd": Buffer<ab4feaf4>,
    "cdbcacebbabbd": Buffer<c3335dae>,
}
```

Maybe there's a way to even get rid of the Map structure, this would imply that rholang can manipulate byte arrays.

Local deploy, 200 values depth = 2
PUBLIC_READ_ALL_PURSES 200 values = 13s

Local deploy, 450 values depth = 2
PUBLIC_READ_ALL_PURSES 200 values = 16.52s

Local deploy, 1400 values depth = 2
PUBLIC_READ_ALL_PURSES 1400 values = 43.9s

Local deploy, 15 values depth = 2
PUBLIC_READ_ALL_PURSES 15 values = 8.7s

Local deploy, 100 values depth = 2
PUBLIC_READ_ALL_PURSES 100 values = 11.8s
time to create purse (time between purse.SWAP logs) = 1,2s

**2021-04-22**

Local deploy, 2900 values depth = 2
PUBLIC_READ_ALL_PURSES 2900 values = 66.7s

Local deploy, 2900 values depth = 2
PUBLIC_READ_ALL_PURSES 2900 values = 63.7s

Local deploy, 150 values depth = 2
PUBLIC_READ_ALL_PURSES 150 values = 11.6s, 12.7s, 11.8s, 11.6s, 11.4s, 11.6s

**2021-05-20 6.0.0**

Local deploy, 3300 values depth = 2
PUBLIC_READ_ALL_PURSES 3300 values = 99.7s, 98.8s

Local deploy, 340 values depth = 2
PUBLIC_READ_ALL_PURSES 340 values = 43s, 14s, 13s
