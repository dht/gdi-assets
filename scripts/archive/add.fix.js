const fs = require('fs-extra');

const allBoards = fs.readJsonSync('./allBoards.json');

const run = async () => {
  for (let i = 32; i < allBoards.length; i++) {
    const item = allBoards[i];
    item.boardInfo.index = i + 1;
    item.boardInfo.order = i + 1;
    console.log(item.boardInfo.index, i);
  }

  fs.writeJsonSync('./allBoards.out.json', allBoards, { spaces: 2 });
};

run();
