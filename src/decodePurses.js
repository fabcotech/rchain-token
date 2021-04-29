// store-as-bytes-map
module.exports.decodePurses = (expr, rhoExprToVar, decodePar) => {
  const purses = {};

  Object.keys(expr.ExprMap.data).forEach((k) => {
    const a = expr.ExprMap.data[k];
    if (a && a.ExprBytes && a.ExprBytes.data) {
      const b = Buffer.from(a.ExprBytes.data, 'hex');
      try {
        const valJs = rhoExprToVar(decodePar(b).exprs[0]);
        purses[valJs.id] = valJs;
      } catch (err) {
        throw err;
      }
    }
  });
  return purses;
};

// store-as-bytes-array
/*
const DELIMITER = 'c2a324c2a324c2a324c2a324'; // '£$£$£$£$' represented has hex
const INSIDE_DELIMITER = 'c2a324c2a324'; // '£$£$' represented has hex
module.exports.decodePurses = (expr, rhoExprToVar, decodePar) => {
  const purses = {};
  if (expr && expr.ExprBytes && expr.ExprBytes.data) {
    expr.ExprBytes.data
      .split(DELIMITER)
      // remove empty string at first index
      .filter((section) => !!section)
      .forEach((section) => {
        const b = Buffer.from(section.split(INSIDE_DELIMITER)[1], 'hex');
        try {
          const par = decodePar(b).exprs[0];
          const valJs = rhoExprToVar(par);
          purses[valJs.id] = valJs;
        } catch (err) {
          throw err;
        }
      });
  }
  return purses;
}; */
