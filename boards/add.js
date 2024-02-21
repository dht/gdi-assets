const fs = require('fs-extra');

let files = [];
let lastActive = 22;

const allBoards = fs.readJsonSync('./allBoards.json');

const readFiles = () => {
  files = fs
    .readdirSync('./_new')
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      const json = fs.readJsonSync('./_new/' + file);

      return {
        file,
        json,
      };
    });
};

const replaceContent = (filePath, oldContent, newContent) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const regex = new RegExp(oldContent, 'g');
  newContent = content.replace(regex, newContent);
  fs.writeFileSync(filePath, newContent, 'utf-8');
};

const createBoard = (index, json) => {
  const id = `B-${lz(index)}`;

  fs.removeSync(`./${id}`);
  fs.ensureDirSync(`./${id}`);
  fs.copySync('./_template', `./${id}`);

  const configPath = `./${id}/${id}.json`;
  const flowPath = `./${id}/${id}.flow.json`;

  fs.renameSync(`./${id}/B-001.flow.json`, flowPath);
  fs.renameSync(`./${id}/B-001.json`, configPath);

  const currentId = json.id.replace('B-', '');
  const elements = fs.readJsonSync(configPath).elements;

  const boardConfig = {
    ...json,
    elements,
  };

  fs.writeJsonSync(configPath, boardConfig, { spaces: 2 });

  replaceContent(flowPath, '014', lz(index));
  replaceContent(configPath, '014', lz(index));
  replaceContent(configPath, currentId, lz(index));
};

const changeId = (seq, index) => {
  const item = allBoards[seq];

  console.log('item.id =>', item.id);

  const content = JSON.stringify(item, null, 2);
  const regex = new RegExp(item.id, 'g');
  const newId = `B-${lz(index + 1)}`;
  console.log('newId =>', newId);

  const newContent = content.replace(regex, newId);
  allBoards[seq] = JSON.parse(newContent);
};

const updateAllBoards = (index) => {
  const id = `B-${lz(index)}`;

  const configPath = `./${id}/${id}.json`;
  const json = fs.readJsonSync(configPath);
  const seq = allBoards.findIndex((board) => board.id === id);

  for (let i = seq; i < allBoards.length; i++) {
    changeId(i, i + 1);
  }

  allBoards.splice(seq, 0, json);

  fs.writeJsonSync('./allBoards.out.json', allBoards, { spaces: 2 });
};

const run = async () => {
  readFiles();

  for (let file of files) {
    const { json } = file;
    const index = lastActive + 1;

    createBoard(index, json);

    updateAllBoards(index);

    lastActive++;
  }
};

const lz = (num) => {
  return num.toString().padStart(3, '0');
};

run();
