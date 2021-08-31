const rchainToolkit = require('rchain-toolkit');

require('dotenv').config();

const main = async () => {
  const term0 = `new return, entryCh, lookup(\`rho:registry:lookup\`), stdout(\`rho:io:stdout\`) in {
    lookup!(\`rho:id:4nrtbbka1x4awr5r1ub96wyd31m6d6xrho1b5kug7quszq3zzs3za3\`, *entryCh) |
    for(entry <- entryCh) {
      new a in {
        entry!(("READ", *a)) |
        for (@box <- a) {
          return!(box)
        }
      }
    }
  }`;
  const result1 = await rchainToolkit.http.exploreDeploy(
    process.env.READ_ONLY_HOST,
    {
      term: term0,
    }
  );
  const data = rchainToolkit.utils.rhoValToJs(JSON.parse(result1).expr[0]);
  console.log(data);
};

main();
