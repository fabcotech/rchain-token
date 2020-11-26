module.exports.updateBagDataTerm = (
  registryUri,
  newNonce,
  signature,
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
        "type": "UPDATE_BAG_DATA",
        "payload": {
          // signature of the current nonce, with the private key of the owner (generateSignatureForNonce.js)
          "signature": "${signature}",
          // new nonce, must be different and random (generateNonce.js)
          "newNonce": "${newNonce}",
          // bag ID you want to attach data to
          "bagId": "${bagId}",
          // data is used only if new token ("n" : Nil)
          "data": ${data ? '"' + encodeURI(data) + '"' : "Nil"}
        }
      },
      *returnCh
    )
  } |

  for (resp <- returnCh) {
    match *resp {
      String => { stdout!(*resp) }
      true => { stdout!("success, bag data updated") }
    }
  } |

  basket!({ "status": "completed" })

}
`;
};