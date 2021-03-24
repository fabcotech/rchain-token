const rc = require('rchain-toolkit');

module.exports.main = (name) => {
  try {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        try {
          rc.http
            .dataAtName(process.env.VALIDATOR_HOST, {
              name: {
                UnforgPrivate: { data: name },
              },
              depth: 3,
            })
            .then((dataAtNameResponse) => {
              if (
                dataAtNameResponse &&
                JSON.parse(dataAtNameResponse) &&
                JSON.parse(dataAtNameResponse).exprs &&
                JSON.parse(dataAtNameResponse).exprs.length
              ) {
                resolve(dataAtNameResponse);
                clearInterval(interval);
              } else {
                console.log('  .');
              }
            })
            .catch((err) => {
              console.log(err);
              throw new Error('wait for unforgeable name');
            });
        } catch (err) {
          console.log(err);
          throw new Error('wait for unforgeable name');
        }
      }, 4000);
    });
  } catch (err) {
    console.log(err);
    throw new Error('wait for unforgeable name');
  }
};
