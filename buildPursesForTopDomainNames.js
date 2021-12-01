const fs = require('fs');

const csv = fs.readFileSync('./top-1m.csv', 'utf8');
const lines = csv.split('\r\n');

const NAMES_TO_PERFORM = 40000;
const ADDRESS = '';
const ALSO_RESERVE_GENERIC_CODES = true;

const ids = {};
const duplicates = {};
const invalids = {};
console.log(lines.length, 'domain names in top-1m.csv file');
let j = 0;
for (let i = 0; i < lines.length - 1; i += 1) {
  const domainName = lines[i].split(',')[1];
  if (i % 1000 === 0) {
    console.log(i, domainName);
  }
  if (j === NAMES_TO_PERFORM) {
    console.log(
      'reached ' + NAMES_TO_PERFORM + ' names at index ' + i + ' in csv file'
    );
    break;
  }
  const name = domainName.split('.')[domainName.split('.').length - 2];
  const match = (name || '').match(/[a-z]([A-Za-z0-9]*)*/g);
  if (!match || (match.length !== 1 && match[0].length !== name.length)) {
    const match2 = (name || '').match(/[a-z]([A-Za-z0-9-]*)*/g);
    // it only contains dash, like coca-cola
    if (match2 && match2.length === 1 && match2[0].length === name.length) {
      const trueName = name.replace(/\-/g, '')
      ids[trueName] = true;
      j += 1;
    } else {
      invalids[name] = 'regexp';
    }

  } else if (!name || name.length > 24 || name.length < 1) {
    invalids[name] = 'length';
  } else if (ids[name]) {
    if (!duplicates[name]) {
      duplicates[name] = [domainName];
    } else {
      duplicates[name].push(domainName);
    }
  } else {
    ids[name] = true;
    j += 1;
  }
}

const data = Buffer.from(
  JSON.stringify({
    address: ADDRESS,
    servers: [],
    badges: {},
  })
).toString('hex');

if (ALSO_RESERVE_GENERIC_CODES) {
  let generics = [];
  const tlds2 = fs.readFileSync('./tlds.txt', 'utf8');
  tlds2.split('\n').forEach((tld) => {
    const name = tld.toLowerCase();
    const match = (name || '').match(/[a-z]([A-Za-z0-9]*)*/g);
    if (match && match[0] && match[0].length === name.length) {
      if (ids[name]) {
        console.warn('generic tld ' + name + ' is duplicate');
        if (!duplicates[name]) {
          duplicates[name] = [name];
        } else {
          duplicates[name].push(name);
        }
      } else {
        ids[name] = true;
        generics.push(name);
      }
    } else {
      console.warn('generic tld ' + name + ' is invalid');
      invalids[name] = 'regexp';
    }
  });
  console.log(`Also added ${generics.length} generic tld names :`);
  console.log(generics.join(', '));
}

fs.writeFileSync('./name-duplicates.json', JSON.stringify(duplicates, null, 2));
if (Object.keys(invalids).length) {
  fs.writeFileSync('./name-invalids.json', JSON.stringify(invalids, null, 2));
}

Object.keys(ids).forEach((id) => {
  ids[id] = {
    id: id,
    data: data,
    quantity: 1,
  };
});

fs.writeFileSync('./name-purses.csv', Object.keys(ids).join(`;\n`), 'utf8');
fs.writeFileSync('./name-purses.json', JSON.stringify(ids, null, 2), 'utf8');
/* let blacklist = {};
Object.keys(ids).forEach((id) => {
  blacklist[id] = true;
});
fs.writeFileSync(
  './blacklist.json',
  JSON.stringify(blacklist, null, 2),
  'utf8'
); */

console.log(
  `\nPrepared a total of ${Object.keys(ids).length} purses in name-purses.json`
);
console.log(
  `${
    Object.keys(invalids).length
  } invalid names (regexp or length) see name-invalids.json`
);
console.log(
  `${Object.keys(duplicates).length} duplicates names see name-duplicates.json`
);
