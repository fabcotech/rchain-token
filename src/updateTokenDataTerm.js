module.exports.updateTokenDataTerm = (
  registryUri,
  payload,
  signature, 
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
        "type": "UPDATE_TOKEN_DATA",
        // signature of the payload + contract nonce in it, with the private key of the owner (generateSignatureForNonce.js)
        "signature": "${signature}",
        "payload": {
          // new nonce, must be different and random (generateNonce.js)
          "newNonce": "${payload.newNonce}",
          // token ID you want to attach data to
          "n": ${typeof payload.n == "string" ? '"' + payload.n + '"' : "Nil"},
          // data is used only if new token ("n" : Nil)
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
        stdout!("completed, data updated")
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