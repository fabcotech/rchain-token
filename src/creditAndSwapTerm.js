// rholang terms
const { creditTerm } = require('./creditTerm');
const { swapTerm } = require('./swapTerm');

module.exports.creditAndSwapTerm = (
  payloadCredit,
  payloadSwap
) => {

  const term1 = creditTerm(payloadCredit);
  const indexStart = term1.indexOf('// OP_CREDIT_COMPLETED_BEGIN');
  const indexEnd = term1.indexOf('// OP_CREDIT_COMPLETED_END');

  const term2 = term1.slice(0, indexStart) + term1.slice(indexEnd).replace(
    `// OP_CREDIT_COMPLETED_END`,
    `${swapTerm(payloadSwap).replace('basket,', '')}`
  );

  return term2;
};
