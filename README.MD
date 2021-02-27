### Rholang (RChain) token (v4)

Fungibles and non-fungibles tokens on the RChain blockchain.

This repo includes a CLI so you can very quickly start playing with rchain-token contract, and SDK that you can integrate in any javascript application.

![RChain token](https://i.ibb.co/qrnCwVp/rchaintoken.png)

### Using CLI

First rename the `.env.example` file to `.env` and eventually update the values to connect to another RChain network than RChain testnet. You must also add your private key in `.env` file so it will not appear on the screen and command line history.

```
# Deploy a box to store purses
node cli deploy-box
# Deploy a contract, the super key (admin/owner capability for this contract) will be stored in the box
node cli deploy

# Create/mint a purse with 12 tokens "GOLD" using the admin/owner capability
node cli create-purse --quantity 12 --token "GOLD"
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

**Tokens/bags operations**

```
# Lock contract, no token will ever be created in this contract anymore
node cli lock --registry-uri 6yt4 --contract-nonce daec
```

```
# Create purse
# You need to have the contract's super key in your box
node cli create-purse --quantity 12 --token GOLD
```

```
# Send a purse to a box address
CLI NOT IMPLEMENTED YET
```

**Data operations**

```
# Update data associated with a token
node cli update-token-data --registry-uri 6yt4 --file ./README.MD --contract-nonce daec --token 0
```

```
# Update data associated with a bag
# --nonce is the bag nonce, not the contract nonce
node cli update-token-data --registry-uri 6yt4 --file ./README.MD --nonce 1f4c --bag 0
```

Missing in CLI: playing with token data and bag data, changing price of a bag of tokens

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
