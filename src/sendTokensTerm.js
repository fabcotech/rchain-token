module.exports.sendTokensTerm = (
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
        "type": "SEND_TOKENS",
        // signature of the payload + bag nonce in it, with the private key of the bag owner (generateSignatureForNonce.js)
        "signature": "${signature}",
        "payload": {
          // new nonce, must be different and random (generateNonce.js)
          "bagNonce": "${payload.bagNonce}",
          // new nonce for the new bag
          "bagNonce2": "${payload.bagNonce2}",
          // bag ID (ex: "0")
          "bagId": "${payload.bagId}",
          // quantity of tokens to send
          "quantity": ${payload.quantity},
          // publicKey this send those tokens to (can be the same just split a bag)
          "publicKey": "${payload.publicKey}",
          // data (optional) to be attached to the new bag (in bagsData)
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
        stdout!("completed, tokens send")
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
