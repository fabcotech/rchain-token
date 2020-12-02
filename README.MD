### Rholang (RChain) token (v4)

**This is the #files branch/fork** of the standard rchain-token **[master](https://github.com/fabcotech/rchain-token)** branch. This one is tweeked to allow indexing bags by string instead of `0`, `1`, `2` etc. It can be used to represent files, as well as names in the dappy name system for example.

Except for the bags created with `"CREATE_TOKENS"` by the owner, all bags have `"quantity": 1`. Bag with ID `"0"` is special, it is the only one that when you purchase from it (you always purchase `"quantity": 1`), you can create an new bag with arbitrary ID, see `./purchase_tokens.rho`. Make sure you ALWAYS create a bag with ID `"0"` right after you deploy, fancy things could happen if you don't.

Fungibles and non-fungibles tokens on the RChain blockchain. Includes buy/sell capabilities by default, metadata that can be associated to a token type (ex: pizza), or a specific set of tokens (pizza n°1021).

This repo includes a CLI so you can very quickly start playing with rchain-token contract, and SDK that you can integrate in any javascript application.

![RChain token](https://i.ibb.co/qrnCwVp/rchaintoken.png)

### Using CLI

First rename the `.env.example` file to `.env` and eventually update the values to connect to another RChain network than RChain testnet. You must also add your private key in `.env` file so it will not appear on the screen and command line history.

```
# Deploy a new empty rchain-token contract
node cli deploy
# With default bags and/or data, see bags.example.json file
node cli deploy --bags-file ./bags.json
```

After having first deployed, `registry URI` and other values are logged to the console. `registry URI` is the identifier/location of the rchain-token contract on the blockchain.

Aliases: You can use `-r` option instead of `--registry-uri`, you can also add a line `REGISTRY_URI=*` in `.env` file and do not provide this option at all, `node cli deploy` should add this line in `.env` file.

**View**

```
# Check contract's public key, nonce, locked true/false, and bags
node cli view --registry-uri 6yt4
```

```
# Check a specific bags in a contract
node cli view --registry-uri 6yt4 --bag 0
```

```
# Check the data associated with a bag
node cli view-data --registry-uri 6yt4 --bag 12
# Check the data associated with a token
node cli view-data --registry-uri 6yt4 --token 3
```

**Tokens/bags operations**

```
# Lock contract, no token will ever be created in this contract anymore
node cli lock --registry-uri 6yt4 --contract-nonce daec
```

```
# Create tokens
# If --token is not given, a new token id will be created
# If --price is not given, the tokens won't be for sale
node cli create-tokens --registry-uri 6yt4 --contract-nonce daec --price 10 --quantity 3  --token 0
```

```
# Purchase tokens from a bag
# If --price is not given, the tokens won't be for sale
node cli purchase-tokens --registry-uri 6yt4  --price 100 --from-bag 0 --quantity 3
```

```
# Send tokens, which is equal to splitting a bag into two bags
# --nonce is the bag nonce, not the contract nonce
node cli send-tokens --registry-uri 6yt4 --nonce 1f4c --from-bag 0 --quantity 7 --public-key aaa
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
const uuidv4 = require("uuid/v4");

const publicKey = 'aaa';
const nonce = uuidv4().replace(/-/g, "");
const rholangTerm = mainTerm(
  nonce,
  publicKey
)
```

Missing in CLI: changing price of a bag of tokens

### Compile rholang -> javascript (src/)

_Generate all javascript source code in `src/` from rholang with `node generateJavascripts.js`

### Token representation on chain

3 channels contains every data that is needed :

- `bags` : map indexed per bag ID, a bag can contain 0, 1, 1000 or more tokens. Many bag may point to the same token type (= token ID).
- `tokensData` : map containing the data associated with each token, it can be anything, depending on the usecase (JSON, images, files etc...), example: `{ "model": "Peugeot 308" }`. The owner of a bag _cannot_ change the data associated to the token.
- `bagsData` : map containing the data associated with each bag (a bag is a token ownership), it can be anything, depending on the usecase (JSON, images, files etc...), example: `{ "color": "red" }`. The owner of a bag _is the only person who can_ change the data associated to the bag.
- `mainCh` : map that contains data about this contract : `registryUri`, unique `nonce` that is changed each time an admin action is performed, `publicKey` of the owner (person who can lock and create tokens), `locked` boolean.

### Methods exposed

Through the `entry` channel that is exposed to the registry, any user can interact with this contract, you can just check the other `.rho` files of this repository to see what's possible .

- `CREATE_TOKENS` (owner only) : at anytime, the owner can create some more tokens, see `create_token.rho`.
- `SET_LOCKED` (owner only): the owner (person who initially deploy) can create tokens, and set the locked value. Once he locks the contract, he has no specific right or power over it, the contract is left to itself. The total tokens amount won't change anymore, the tokens data cannot be changed anymore, it is basically a free market, people can set a price for a token, sell and buy them, see `set_locked.rho`.
- `UPDATE_TOKEN_DATA`(owner only and not locked): Update the data associated with a token (not a bag).
- `PURCHASE_TOKENS` : any user can purchase a token that has a quantity superior to one, see `purchase_token.rho`.
- `SEND_TOKENS` : any user can send tokens he owns to another public key. This will split a bag into two bags, it can also be the same public key, eventually to sell just a portion of tokens.
- `UPDATE_BAG_DATA`: Any user who owns tokens can update the data associated with this bag.
- `READ` : reads the value in `mainCh` and returns it, see `set_locked.rho`.
- `READ_TOKENS` : reads the value in `tokens` and returns it, see `read_tokens.rho`.
- `READ_TOKENS_DATA` : reads the value in `tokensData` and returns it, see `read_tokens_data.rho`.

### Compile for browser and dappy browser

Change version in `src/index.js` and in `rollup.config.js`.

```
npm run build:browser
```

### TODO

- Exchange capabilities

  "askPublicKey": "aaa",
  "OfferPublicKey": "bbb",
  "uniqueIdAsk": [{ "amount": 4, "n": "3" }]
  "uniqueIdOffer": [{ "amount": 1, "uniqueId": "3" }],
  "sellerSignature": "aaa",
  "buyerSignature": "bbbb"
