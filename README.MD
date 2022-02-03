### Rholang (RChain) token

Fungibles and non-fungibles tokens on the RChain blockchain.

This repo includes a CLI so you can very quickly start playing with rchain-token contract, and SDK that you can integrate in any javascript application. The code and architecture takes advantage of [rholang's](https://rchain.coop/) powerful model of computation, and state of the art OCAP (object capabilities) paradigm to manage authorizations.

![RChain token](https://i.ibb.co/qrnCwVp/rchaintoken.png)

Object capabilities is a safe, no-encryption and flexible way to express ownership, permissions or authorizations. See or read about object capabilities [here](https://www.youtube.com/watch?v=EGX2I31OhBE), [here](https://www.youtube.com/watch?v=ZnBbi6ifzdo) or [here](http://erights.org/elib/capability/ode/ode-capabilities.html).

### What is a master contract ?

A master contract hosts boxes, contracts (NFT or FT) and purses inside those contracts. A deployment of rchain-token is the deployment of the master contract. Swap capabilities can be inter-contract, boxes can send NFTs or FTs to each other. Inter-master communications or exchange would need some trusted bridges.

### Burning with _burn

`_burn` is a special box, if you withdraw NFT or FT to box `_burn` it will be ... burned.

### Wrapped REV

From release 16 every swap must be token-to-token , which means that you cannot put a sell order on a NFT, and sell it against REV. An automatic fungile wrapped REV contract exists for the purpose of having a guaranteed one-to-one fungible token that represents REV inside a master.

The id of the contract is `[prefix]rev`, `prefix` being a the first 3 letters of the registry URI of the master. Use the `CREDIT` capability to credit REV, and have wrapped rev in return. Withdraw to special box `_rev` to recover true REV from wrapped REV.

**Note**: wrapped REV contract use the same decimals as REV: 1 wrapped REV = 1 dust = 10^-8 true REV

### Use CLI

Rename the `.env.example` file to `.env` and eventually update the values to connect to another RChain network than RChain testnet. You must also add your private key in `.env` file so it will not appear on the screen and command line history.

```
# Deploy a master contract, that handles both boxes and contracts
node cli deploy-master
```

##### non-fungible tokens

Non-fungibles (NFT) tokens are identified by an ID like "pikachu", "amazon" or "cat123". They are still represented by purses, all purses have `quantity: 1`, a NFT purse cannot be divided. Purse `"0"` is a special mint purse from which you can purchase, and give a `newId` of your choice (See `./tests-fungibles/index.js:L229`).

As the owner, be very careful to only give `quantity: 1` when you create purses (except for special purse `"0"`).

```
# the following steps assume you have already deployed a master contract

# deploy a box that can store FTs, NFTs and super keys
node cli deploy-box --box-id mybox

# deploy contract and save super key to box
node cli deploy --fungible false --contract-id "mynft"

# create a non-fungible "cat123" token (quantity is always 1 for non-fungibles)
node cli create-purse --quantity 1 --new-id "cat123"

# after the deployed is processed you can check that your purse is created
node cli view
```

##### fungible tokens

Fungibles tokens purses can have a quantity superior to one. For examples 100 gold tokens, 1000 shares that can be exchanged, or any ERC-20 tokens will be fungible. The IDs of purses are automatically incremented (0, 1, 2 etc.), they do not matter that much.

```
# the following steps assume you have already deployed a master contract and a box

# deploy contract and save super key to box
node cli deploy --fungible true --contract-id "mytoken"

# Create/mint a purse with 12 tokens "[prefix]mytoken" using the admin/owner capability
node cli create-purse --quantity 12

# after the deployed is processed you can check that your purse is created
node cli view
```

##### CLI

**View**

```
# Check the content of a box (super keys and purses)
node cli view-box
```

```
# Check contract's locked (true/false), and purses
node cli view
```

```
# Check a specific purse in a contract
node cli view --purse-id 0
```

**Purses/tokens operations**

```
# Send a purse from a box to another box
CLI NOT IMPLEMENTED YET
```

##### Methods/operations available

ro = Read only, it does not change the state of box or contract in any wey

The methods prefixed with `PUBLIC_` are accessible by any rholang execution, the others are only available for the owners of a box or super key (contract), following the OCAP paradigm.

###### Master

All methods are public

```
ro PUBLIC_READ_PURSES_AT_INDEX: (contractId: String, index: Int) => String | Map(purses at index)
ro PUBLIC_READ_BOX: (boxId: String) => String | Map(box purses and config)
ro PUBLIC_READ_PURSE: ({ contractId: String, purseId: String }) => Map(purses)
ro PUBLIC_READ_PURSE_DATA: ({ contractId: String, purseId: String }) => Map(purses data)
ro PUBLIC_READ_CONFIG: (contractId: String) => String | Map(contract config)
PUBLIC_REGISTER_BOX: ({ boxId: String, publicKey: String }) => String | (true, { "boxId": String, "boxCh": box ocap object})
PUBLIC_DELETE_EXPIRED_PURSE: (contractId: String, purseId: String) => String | (true, Nil)
```

Check files in `./src` if you want to know how to get many purses, or all purses using the methods above.

###### Box

A box (OCAP) is usually stored in a private channel like `@(*deployerId, "rchain-token-box", "MASTER_REGISTRY_URI", "BOX_ID")`, see `op_deploy_box.rho` for example.

All the methods on a box are private (owner of the box only).

```
ro READ: () => Properties of the purse (quantity, price, box, publicKey)
REGISTER_CONTRACT: ({ contractId: string, fungible: Bool, fee: Nil | (String, int) }) => String | (true, { "contractId": String, "superKey": super key ocap object })
UPDATE_PURSE_PRICE: ({ contractId: String, purseId: String, price: (String, Int) | (String, String) | Nil }) => String | (true, super key ocap object)
UPDATE_PURSE_DATA:  ({ contractId: String, purseId: String, data: any }) => String | (true, super key ocap object)
WITHDRAW:  ({ contractId: String, purseId: String, quantity: Int, toBoxId: String, merge: Bool }) => String | (true, Nil)
CREDIT:  ({ purseRevAddr: String, purseRevAddr: VaultAuthKey }) => String | (true, Nil)
SWAP:  ({ contractId: String, purseId: String, quantity: Int, merge: Bool, newId: String | Nil, data: any }) => String | (true, Nil)
RENEW:  ({ contractId: String, purseId: String, purseRevAddr: String, purseRevAddr: VaultAuthKey }) => String | (true, Nil)
```

###### Contract (super key)

The ownership of a contract is expressed by the ownership of a super key that is returned by `REGISTER_CONTRACT` method. A contract's super key (OCAP) is usually stored in a private channel like `@(*deployerId, "rchain-token-contract", "MASTER_REGISTRY_URI", "CONTRACT_ID")`, see `op_deploy.rho` for example.

All the methods on a super key are private (deployer of the contract only).

```
LOCK: () => String | (true, Nil) // cannot CREATE_PURSE/DELETE_PURSE/UPDATE_FEE anymore after a contract is locked
CREATE_PURSE: see `cli/createPurse.js` or `src/createPursesTerm`.
UPDATE_FEE: see `cli/updateFee.js` or `src/updateFeeTerm`.
DELETE_PURSE: see `cli/deletePurse.js` or `src/deletePursesTerm`.
```

##### Using SDK

The SDK files are in `./src`, if you have rchain-token (`fabcotech/rchain-token`) as a dependency of your project, you should be able to use them very easily.

```
import {
  masterTerm,
} from "rchain-token";

const rholangTerm = masterTerm({
  depth: 3,
  contractDepth: 2,
})
```

##### Compile rholang -> javascript (src/)

\_Generate all javascript source code in `src/` from rholang with `npm run generate`

##### Testing

Have a local rnode instance running with the following bonds and wallets file. And automatic propose every x seconds. The private keys used for deployments are in `tests-ft/index.js` and `tests-nft/index.js`.

wallets.txt

```
0x3769b4e68650bdfc7b55375034be6ee52978a14f,1000000000000,0
0x7f847d40c3ec604fe3d4263bfdd04111eb9b4e32,1000000000000,0
```

bonds.txt

```
04be064356846e36e485408df50b877dd99ba406d87208add4c92b3c7d4e4c663c2fbc6a1e6534c7e5c0aec00b26486fad1daf20079423b7c8ebffbbdff3682b58 100000000000
```

Also have at least those 2 lines in your .env file

```
READ_ONLY_HOST=http://127.0.0.1:40403
VALIDATOR_HOST=http://127.0.0.1:40403
```

`npm run test:ft`
`npm run test:nft`
`npm run test:credit`

##### Stressing

Many stress tests exist, see `stress/stress_*` files, you might want to change the variables on the top of each file.

example:

```
node stress/stress_createPurses.js
node stress/stress_createPursesAndReadAll.js
```