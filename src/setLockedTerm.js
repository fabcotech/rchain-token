module.exports.setLockedTerm = (registryUri, newNonce, signature) => {
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
        "type": "SET_LOCKED",
        "payload": {
          // signature of the current nonce, with the private key of the owner (generateSignatureForNonce.js)
          "signature": "${signature}",
          // new nonce, must be different and random (generateNonce.js)
          "newNonce": "${newNonce}",
          //you cannot unlock, this value must always be true
          "locked": true
        }
      },
      *returnCh
    )
  } |

  for (resp <- returnCh) {
    match *resp {
      String => { stdout!(*resp) }
      true => { stdout!("success, tokens locked") }
    }
  } |

  basket!({ "status": "completed" })

}
`;
};