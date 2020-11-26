module.exports.sendTokensTerm = (
  registryUri,
  signature,
  bagNonce,
  bagNonce2,
  quantity,
  publicKey,
  bagId,
  data    
) => {
  return `new basket,
  entryCh,
  returnCh,
  lookup(\`rho:registry:lookup\`),
  stdout(\`rho:io:stdout\`)
in {

  lookup!(\`rho:id:${registryUri}\`, *entryCh) |

  for(entry <- entryCh) {
    entry!(
      {
        "type": "SEND_TOKENS",
        "payload": {
          // signature of the current nonce, with the private key of the owner (generateSignatureForNonce.js)
          "signature": "${signature}",
          // new nonce, must be different and random (generateNonce.js)
          "bagNonce": "${bagNonce}",
          // new nonce for the new bag
          "bagNonce2": "${bagNonce2}",
          // bag ID (ex: "0")
          "bagId": "${bagId}",
          // quantity of tokens to send
          "quantity": ${quantity},
          // publicKey this send those tokens to (can be the same just split a bag)
          "publicKey": "${publicKey}",
          // data (optional) to be attached to the new bag (in bagsData)
          "data": ${data ? '"' + encodeURI(data) + '"' : "Nil"}
        }
      },
      *returnCh
    )
  } |

  for (resp <- returnCh) {
    match *resp {
      String => { stdout!(*resp) }
      true => { stdout!("success, tokens sent") }
    }
  } |

  basket!({ "status": "completed" })

}
`;
};