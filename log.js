const rc = require('rchain-toolkit');
const { rhoExprToVar } = require('rchain-toolkit/dist/utils');

const { readMasterConfigTerm } = require('./src');

require('dotenv').config();


const BLOCKS_PER_BATCH = 20;

const isBlockAlreadyKnown = (blockHash, knownBlocks) => !!knownBlocks.find(kb => kb === blockHash)

// a block pos is known, 
const findOldestUnknownBlockInBatch = (knownBlocks, position) => {
  let i = 1;
  return new Promise((resolve) => {
    const goForBlock = async () => {
      console.log('findOldestUnknownBlockInBatch', position - 1)
      let blockJustAfter = await rc.http.blocks(process.env.READ_ONLY_HOST, { position: position - i });
      blockJustAfter = JSON.parse(` { "blocks": ${blockJustAfter} }`).blocks[0].blockHash;
      if (isBlockAlreadyKnown(oldestBlockOfBatch, knownBlocks)) {
        if (i === 10) {
          throw new Error('A unknown block was not found in batch, position : ', position)
        }

        i += 1;
        goForBlock();
        return;
      }

      resolve(blockJustAfter);
    }
  })

}
const findOldestUnknownBlock = (knownBlocks, lastBatchOfBlocks) => {

  let oldestUnknownBlock = undefined;
  let oldestUnknownBlockIndex = undefined;
  const oldestBlockHashIndex = lastBatchOfBlocks.forEach((b, i) => {
    if(!knownBlocks.includes(b.blockHash)) {
      oldestUnknownBlock = b;
      oldestUnknownBlockIndex = i;
    }
  });

  if (oldestUnknownBlockIndex === lastBatchOfBlocks.length - 1) {
    console.warn('[warning] oldest unknown block is the oldest of last 20 blocks, we may have missed dome blocks')
  };

  return oldestUnknownBlock;


  return ;
  let i = 1;

  return new Promise((resolve) => {
    const goForBatch = async () => {
      console.log('position', i * 10);
      let oldestBlockOfBatch = await rc.http.blocks(process.env.READ_ONLY_HOST, { position: i * 10 });
  
      oldestBlockOfBatch = JSON.parse(` { "blocks": ${oldestBlockOfBatch} }`).blocks[0].blockHash;
      console.log('oldestBlockOfBatch',  i * 10, oldestBlockOfBatch)
  
      if (!isBlockAlreadyKnown(oldestBlockOfBatch, knownBlocks)) {
        i += 1;
        goForBatch();
        return;
      }

      const oldestUnknownBlockInBatch = await findOldestUnknownBlockInBatch(knownBlocks, i * 10);
      console.log('oldestUnknownBlockInBatch');
      console.log(oldestUnknownBlockInBatch);

  
  
      console.log('oldestBlockOfBatch', oldestBlockOfBatch);
      console.log('isBlockAlreadyKnown', isBlockAlreadyKnown(oldestBlockOfBatch, knownBlocks));
  
    }
    goForBatch() 
  })
}

const checkNewLogs = async () => {
  let knownBlocks = [];
  try {
    knownBlocks = JSON.parse(fs.readFileSync('./logs_known_blocks.json', 'utf8').blocks);
  } catch (err) {}

  let lastBatchOfBlocks = await rc.http.blocks(process.env.READ_ONLY_HOST, { position: BLOCKS_PER_BATCH });

  lastBatchOfBlocks = JSON.parse(`{ "blocks": ${lastBatchOfBlocks}}`).blocks;
  
  let oldestUnknownBlock = findOldestUnknownBlock(knownBlocks, lastBatchOfBlocks);

  const result0 = await rc.http.exploreDeploy(process.env.READ_ONLY_HOST, {
    term: readMasterConfigTerm({ masterRegistryUri: process.env.MASTER_REGISTRY_URI }),
  });
  const logsChannel = rc.utils.rhoValToJs(JSON.parse(result0).expr[0]);

  const indexToStart = lastBatchOfBlocks.findIndex(a => a.blockHash === oldestUnknownBlock.blockHash);
  console.log('indexToStart', indexToStart);

  let s = ''
  const getLogsForIndex = async (i) => {
    const b = lastBatchOfBlocks[i];
    console.log(b.blockNumber, new Date(b.timestamp))
    const logs = await rc.http.dataAtNameByBlockHash(
      process.env.READ_ONLY_HOST,
      {
        name: {
          UnforgPrivate: {
            data: logsChannel.logsCh.UnforgPrivate
          }
        },
        blockHash: oldestUnknownBlock.blockHash,
        usePreStateHash: false,
      }
    );

    console.log(logs)
    if (logs !== '"None.get"') {
      console.log('yes')
      /* const data = rc.utils.rhoValToJs(
        JSON.parse(logs).exprs[0].expr
      );
      console.log(data); */
    }
    if (i > 0) {
      return await getLogsForIndex(i - 1)
    }
  }
  await getLogsForIndex(indexToStart);

  console.log('ok')


}

checkNewLogs();