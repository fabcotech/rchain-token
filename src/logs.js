module.exports.logs = {
  checkLine: (s) => {
    if (s.startsWith('p')) {
      const split = s.split(',');
      const toBox = split[1];
      if (typeof toBox !== 'string' || toBox.length === 0) {
        throw new Error('Incorrect toBox 2nd value');
      }
      const fromBox = split[2];
      if (typeof fromBox !== 'string' || fromBox.length === 0) {
        throw new Error('Incorrect fromBox 3rd value');
      }
      const quantity = parseInt(split[3], 10);
      if (typeof quantity !== 'number' || isNaN(quantity) || quantity < 1) {
        throw new Error('Incorrect quantity 4th value');
      }
      const price = parseInt(split[4], 10);
      if (typeof price !== 'number' || isNaN(price) || price < 1) {
        throw new Error('Incorrect price 5th value');
      }
      const pursePurchasedFrom = split[5];
      if (
        typeof pursePurchasedFrom !== 'string' ||
        pursePurchasedFrom.length === 0
      ) {
        throw new Error('Incorrect newPurse 6th value');
      }
      const newPurseId = split[6];
      if (typeof newPurseId !== 'string' || newPurseId.length === 0) {
        throw new Error('Incorrect newPurse 6th value');
      }
    } else {
      throw new Error('Unknown operation');
    }
  },
  isPurchaseFromZero: (s) => {
    if (s.startsWith('p')) {
      const split = s.split(',');
      return split[5] === '0';
    } else {
      return false;
    }
  },
  isNFTPurchase: (s) => {
    if (s.startsWith('p')) {
      const split = s.split(',');
      const parsed = parseInt(split[5]);
      return (
        split[5] === '0' ||
        isNaN(parsed) ||
        parsed.toString().length !== split[5].length
      );
    } else {
      return false;
    }
  },
  formatLine: (s) => {
    if (s.startsWith('p')) {
      const split = s.split(',');
      const parsed = parseInt(split[5]);
      if (
        split[5] === '0' ||
        isNaN(parsed) ||
        parsed.toString().length !== split[5].length
      ) {
        if (split[5] === '0') {
          return `box ${split[1]} minted new NFT ${split[6]} at price ${split[4]}`;
        } else {
          return `box ${split[1]} purchased NFT ${split[6]} from box ${split[2]} at price ${split[4]}`;
        }
      } else {
        return `box ${split[1]} purchased ${split[3]} token${
          split[3] === '1' ? '' : 's'
        } from box ${split[2]} at price ${split[4]}`;
      }
    } else {
      throw new Error('Unknown operation');
    }
  },
};
