const rc = require('rchain-toolkit');

const DELIMITER = 'c2a324c2a324c2a324c2a324'; // '£$£$£$£$' represented has hex
const INSIDE_DELIMITER = 'c2a324c2a324'; // '£$£$' represented has hex

module.exports.decodePurses = (expr) => {
  const purses = {};
  if (expr && expr.ExprBytes && expr.ExprBytes.data) {
    expr.ExprBytes.data
      .split(DELIMITER)
      // remove empty string at first index
      .filter((section) => !!section)
      .forEach((section) => {
        const b = Buffer.from(section.split(INSIDE_DELIMITER)[1], 'hex');
        try {
          const par = rc.utils.decodePar(b).exprs[0];
          const valJs = rc.utils.rhoExprToVar(par);
          purses[valJs.id] = valJs;
        } catch (err) {
          throw err;
        }
      });
  }
  return purses;
};
