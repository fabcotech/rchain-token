### Rholang (RChain) token (v 5.0.2)

Fungibles and non-fungibles tokens on the RChain blockchain.

This repo includes a CLI so you can very quickly start playing with rchain-token contract, and SDK that you can integrate in any javascript application. The code and architecture takes advantage of [rholang's](https://rchain.coop/) powerful model of computation, and state of the art OCAP (object capabilities) paradigm to manage authorizations.

![RChain token](https://i.ibb.co/qrnCwVp/rchaintoken.png)

Object capabilities is a safe, no-encryption and flexible way to express ownership, permissions or authorizations. See or read about object capabilities [here](https://www.youtube.com/watch?v=EGX2I31OhBE), [here](https://www.youtube.com/watch?v=ZnBbi6ifzdo) or [here](http://erights.org/elib/capability/ode/ode-capabilities.html).

### Use CLI

Rename the `.env.example` file to `.env` and eventually update the values to connect to another RChain network than RChain testnet. You must also add your private key in `.env` file so it will not appear on the screen and command line history.

```
# Deploy a box to store purses
# This box can store super keys, fungibles and non-fungibles purses
node cli deploy-box
```

**non-fungible tokens**

Non-fungibles tokens are identified by an ID like "pikachu", "amazon" or "cat123". They are still represented by purses, all purses have `quantity: 1`, a purse cannot be divided. Purse `"0"` is a special mint purse from which you can purchase, and give a `newId` of your choice (See `./tests-fungibles/index.js:L220`).

As the owner, be very careful to only give `quantity: 1` when you create purses (except for special purse `"0"`).

```
# deploy contract and save super key to box
node cli deploy --fungible false

# create a non-fungible "cat123" token (quantity is always 1 for non-fungibles)
node cli create-purse --quantity 1 --type "0" --new-id "cat123"
```

**fungible tokens**

Fungibles tokens are identified mainly by the type property, purses can have a quantity superior to one. For examples 100 gold tokens, 1000 shares that can be exchanged, or any ERC-20 tokens will be fungible. The IDs of purses are automatically incremented (0, 1, 2 etc.), they do not matter that much.

```
# deploy contract and save super key to box
node cli deploy --fungible true

# Create/mint a purse with 12 tokens "GOLD" using the admin/owner capability
node cli create-purse --quantity 12 --type "GOLD"

# In the same contract, you can create another purse with another type of tokens
node cli create-purse --quantity 24 --type "SILVER"
```

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
node cli view --purse 0
```

**Purses/tokens operations**

```
# Send a purse from a box to another box
CLI NOT IMPLEMENTED YET
```

### Using SDK

The SDK files are in `./src`, if you have rchain-token (`fabcotech/rchain-token`) as a dependency of your project, you should be able to use them very easily.

```
import {
  mainTerm,
} from "rchain-token";

const boxRegistryUri = 'aaa';
const rholangTerm = mainTerm(boxRegistryUri)
```

Missing in CLI: changing price of a bag of tokens

### Compile rholang -> javascript (src/)

\_Generate all javascript source code in `src/` from rholang with `node generateJavascripts.js`

### Token representation on chain

The paradigm is OCAP (object capabilities).

See `./rholang/main.rho`

### Testing

Have a local rnode instance running with the following bonds and wallets file. And automatic propose every x seconds. The private keys used for deployments are in `tests/index.js`.

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

`npm run test`
