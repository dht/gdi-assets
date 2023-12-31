const fs = require('fs');
const { kebabCase } = require('lodash');

const lz = (number, min = 3) => {
  return `${number}`.padStart(min, '0');
};

const run = async () => {
  const allBoards = JSON.parse(fs.readFileSync('./allBoards.json', 'utf8'));

  allBoards.map((board, index) => {
    const { id } = board;

    delete board['elements'];

    if (index < 10) {
      const filePath = `./${id}/${id}.json`;

      if (fs.existsSync(filePath)) {
        const boardRaw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const { elements } = boardRaw;

        const output = {
          ...board,
          elements,
        };

        fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
      }
    }
  });
};

run();
