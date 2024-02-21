const fs = require('fs-extra');
const { get, set, mapValues } = require('lodash');

const board1 = 850;
const board2 = 10;

const renameBoard = (source, dest) => {
  const sourceId = 'B-' + lz(source);
  const destId = 'B-' + lz(dest);
  const flowId = 'fb-' + lz(dest);

  if (fs.pathExistsSync(`./${destId}`)) {
    fs.removeSync(`./${destId}`);
  }

  console.log('sourceId =>', sourceId);
  console.log('destId =>', destId);

  fs.mkdirSync(`./${destId}/`);
  fs.copySync(`./${sourceId}/`, `./${destId}/`);

  fs.renameSync(`./${destId}/${sourceId}.json`, `./${destId}/${destId}.json`);

  const flowPath = `./${destId}/${sourceId}.flow.json`;
  const flowExists = fs.existsSync(flowPath);

  if (flowExists) {
    fs.renameSync(flowPath, `./${destId}/${destId}.flow.json`);
  }

  let content;

  content = fs.readJsonSync(`./${destId}/${destId}.json`);
  set(content, 'id', destId);
  set(content, 'url', `/boards/${destId}`);
  set(content, 'boardInfo.index', dest);

  const { flowUrl, setupsUrl, playbacksUrl } = content;

  if (flowUrl) {
    content.flowUrl = `/${destId}/${destId}.flow.json`;
  }

  replaceJson(content, (key, value) => {
    if (key === 'boardId') {
      return destId;
    }
  });
  fs.writeJsonSync(`./${destId}/${destId}.json`, content, { spaces: 2 });
  const contentForAllBoards = { ...content };
  contentForAllBoards.elements = {
    default: {},
  };

  if (flowExists) {
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
  }

  fs.removeSync(`./${sourceId}/`);

  const allBoards = fs.readJsonSync('./allBoards.json');
  const index = allBoards.findIndex((board) => board.id === sourceId);

  allBoards[index] = contentForAllBoards;
  fs.writeJsonSync('./allBoards.json', allBoards, { spaces: 2 });
};

const fixSources = () => {
  const allBoards = fs.readJsonSync('./allBoards.json');

  const output = allBoards.map((board) => {
    const { id } = board;
    set(board, 'sourceUrl', `https://github.com/dht/gdi-assets/tree/main/boards/${id}`);
    return board;
  });

  fs.writeJsonSync('./allBoards.json', output, { spaces: 2 });
};

const run = async () => {
  // fixSources();
  renameBoard(board1, board2);
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
