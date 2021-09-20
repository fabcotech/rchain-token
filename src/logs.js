module.exports.logs = {
  checkLine: (s) => {
    if (s.startsWith('p')) {
      const split = s.split(',');
      const ts = parseInt(split[1], 10);
      if (typeof ts !== 'number' || ts < 100) {
        throw new Error('Incorrect timestamp 2nd value');
      }
      const toBox = split[2];
      if (typeof toBox !== 'string' || toBox.length === 0) {
        throw new Error('Incorrect toBox 3rd value');
      }
      const fromBox = split[3];
      if (typeof fromBox !== 'string' || fromBox.length === 0) {
        throw new Error('Incorrect fromBox 4th value');
      }
      const quantity = parseInt(split[4], 10);
      if (typeof quantity !== 'number' || isNaN(quantity) || quantity < 1) {
        throw new Error('Incorrect quantity 5th value');
      }
      const price = parseInt(split[5], 10);
      if (typeof price !== 'number' || isNaN(price) || price < 1) {
        throw new Error('Incorrect price 6th value');
      }
      const pursePurchasedFrom = split[6];
      if (
        typeof pursePurchasedFrom !== 'string' ||
        pursePurchasedFrom.length === 0
      ) {
        throw new Error('Incorrect newPurse 6th value');
      }
      const newPurseId = split[7];
      if (typeof newPurseId !== 'string' || newPurseId.length === 0) {
        throw new Error('Incorrect newPurse 7th value');
      }
    } else {
      throw new Error('Unknown operation');
    }
  },
  isPurchaseFromZero: (s) => {
    if (s.startsWith('p')) {
      const split = s.split(',');
      return split[6] === '0';
    } else {
      return false;
    }
  },
  isNFTPurchase: (s) => {
    if (s.startsWith('p')) {
      const split = s.split(',');
      const parsed = parseInt(split[6]);
      return (
        split[6] === '0' ||
        isNaN(parsed) ||
        parsed.toString().length !== split[6].length
      );
    } else {
      return false;
    }
  },
  formatLine: (s) => {
    if (s.startsWith('p')) {
      const split = s.split(',');
      const parsed = parseInt(split[6]);
      let ts = parseInt(split[1], 10);
      ts = new Date(ts).toISOString().slice(0, 16);
      if (
        split[6] === '0' ||
        isNaN(parsed) ||
        parsed.toString().length !== split[6].length
      ) {
        if (split[5] === '0') {
          return ` ${ts} box ${split[2]} minted new NFT ${split[7]} at price ${split[5]}`;
        } else {
          return ` ${ts} box ${split[2]} purchased NFT ${split[7]} from box ${split[3]} at price ${split[4]}`;
        }
      } else {
        return ` ${ts} box ${split[2]} purchased ${split[4]} token${
          split[4] === '1' ? '' : 's'
        } from box ${split[3]} at price ${split[5]}`;
      }
    } else {
      throw new Error('Unknown operation');
    }
  },
};
