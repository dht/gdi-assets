const fs = require('fs-extra');
const { get, set, mapValues } = require('lodash');

const board1 = 6;
const board2 = 850;

const renameBoard = (source, dest) => {
  const sourceId = 'B-' + lz(source);
  const destId = 'B-' + lz(dest);
  const flowId = 'fb-' + lz(dest);

  if (fs.pathExistsSync(`./${destId}`)) {
    fs.removeSync(`./${destId}`);
  }

  fs.mkdirSync(`./${destId}`);
  fs.copySync(`./${sourceId}/`, `./${destId}/`);

  fs.renameSync(`./${destId}/${sourceId}.json`, `./${destId}/${destId}.json`);
  fs.renameSync(`./${destId}/${sourceId}.flow.json`, `./${destId}/${destId}.flow.json`);

  let content;

  content = fs.readJsonSync(`./${destId}/${destId}.json`);
  set(content, 'id', destId);
  set(content, 'url', `/boards/${destId}`);
  set(content, 'boardInfo.index', dest);

  replaceJson(content, (key, value) => {
    if (key === 'boardId') {
      return destId;
    }
  });
  fs.writeJsonSync(`./${destId}/${destId}.json`, content, { spaces: 2 });
  const contentForAllBoards = { ...content };
  delete contentForAllBoards.elements;

  content = fs.readJsonSync(`./${destId}/${destId}.flow.json`);

  set(content, 'flowConfig.flowId', flowId);

  const assistantIdsMap = {};

  content.flowAssistants = Object.keys(content.flowAssistants).reduce((acc, key) => {
    const value = content.flowAssistants[key];

    delete value.id;

    const newKey = key.replace('as-' + lz(source), 'as-' + lz(dest));

    assistantIdsMap[key] = newKey;

    acc[newKey] = {
      id: newKey,
      ...value,
    };

    return acc;
  }, {});

  replaceJson(content, (key, value) => {
    if (assistantIdsMap[value]) {
      return assistantIdsMap[value];
    }
  });

  fs.writeJsonSync(`./${destId}/${destId}.flow.json`, content, { spaces: 2 });

  return contentForAllBoards;
};

const run = async () => {
  renameBoard(board2, 999);
  const destContent = renameBoard(board1, board2);
  const sourceContent = renameBoard(999, board1);

  console.log('sourceContent ->', sourceContent);
  console.log('destContent ->', destContent);

  console.log('sourceId ->', sourceId);
  const allBoards = fs.readJsonSync('./allBoards.json');
  const index = allBoards.findIndex((board) => board.id === sourceId);
};

const replaceJson = (json, predicate) => {
  Object.keys(json).forEach((key) => {
    const value = json[key];
    if (value && typeof value === 'object') {
      replaceJson(value, predicate);
    } else {
      const newValue = predicate(key, value);
      if (newValue) {
        json[key] = newValue;
      }
    }
  });
};

const lz = (num, count = 3) => {
  return String(num).padStart(count, '0');
};

run();
