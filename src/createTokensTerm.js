module.exports.createTokensTerm = (
  registryUri,
  payload,
  signature,
) => {
  return `new basket,
  returnCh,
  entryCh,
  lookup(\`rho:registry:lookup\`),
  stdout(\`rho:io:stdout\`)
in {

  lookup!(\`rho:id:${registryUri}\`, *entryCh) |

  for(entry <- entryCh) {
    entry!(
      {
        "type": "CREATE_TOKENS",
        // signature of the payload + contract nonce in it, with the private key of the owner (generateSignatureForNonce.js)
        "signature": "${signature}",
        "payload": {
          // new nonce, must be different and random (generateNonce.js)
          "newNonce": "${payload.newNonce}",
          // new nonce for the bag, must be random (generateNonce.js)
          "bagNonce": "${payload.bagNonce}",
          // per token price, can be Nil if the token is not for sale
          "price": ${payload.price || "Nil"},
          // The token you create can be a new one ("n" : Nil)
          // or it can be linked to an existing token data (ex: "n": "0")
          "n": ${typeof payload.n == "string" ? '"' + payload.n + '"' : "Nil"},
          // quantity of tokens to create
          "quantity": ${payload.quantity},
          // publicKey this set of tokens (depending on quantity) will belong to
          "publicKey": "${payload.publicKey}", // used only if new token
          // data you will associated to the new bag (NOT TOKEN DATA)
          "data": ${payload.data ? '"' + payload.data + '"' : "Nil"}
        }
      },
      *returnCh
    )
  } |

  for (resp <- returnCh) {
    match *resp {
      true => {
        basket!({ "status": "completed" }) |
        stdout!("completed, tokens created")
      }
      _ => {
        basket!({ "status": "failed", "message": *resp }) |
        stdout!(("failed", *resp))
      }
    }
  }
}
`;
};