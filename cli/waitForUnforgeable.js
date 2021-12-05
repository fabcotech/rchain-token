const rc = require('rchain-toolkit');

module.exports.main = (name) => {
  try {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        try {
          let resp = undefined;
          rc.http
            .dataAtName(process.env.READ_ONLY_HOST, {
              name: {
                UnforgPrivate: { data: name },
              },
              depth: 3,
            })
            .then((resp) => {
              if (
                resp &&
                JSON.parse(resp) &&
                JSON.parse(resp).exprs &&
                JSON.parse(resp).exprs.length
              ) {
                resolve(resp);
                clearInterval(interval);
              } else {
                console.log('  .');
              }
            })
            .catch((err) => {
              console.log(resp);
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
