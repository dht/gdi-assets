const fs = require('fs-extra');
const { get, set, camelCase, upperFirst } = require('lodash');

const id = '005';
const sourceId = 'B-002';
const targetId = `B-${id}`;

const paths = {
  source: `./${sourceId}`,
  target: `./${targetId}`,
  json: `./${targetId}/${targetId}.json`,
  flow: `./${targetId}/${targetId}.flow.json`,
};

const run = async () => {
  const allBoards = JSON.parse(fs.readFileSync('./allBoards.json', 'utf8'));

  const board = allBoards.find((board) => board.id === targetId);

  // copy directory
  fs.removeSync(paths.target);
  fs.copySync(paths.source, paths.target);
  fs.renameSync(`${targetId}/${sourceId}.json`, paths.json);
  fs.renameSync(`${targetId}/${sourceId}.flow.json`, paths.flow);

  let json;

  json = fs.readJsonSync(paths.json);
  let { elements } = json;

  elements = {
    default: {
      ...Object.keys(elements.default).reduce((acc, key) => {
        const value = elements.default[key];
        value.boardId = targetId;
        acc[key] = value;
        return acc;
      }, {}),
    },
  };

  set(board, 'elements', elements);
  fs.writeJsonSync(paths.json, board, { spaces: 2 });

  json = fs.readJsonSync(paths.flow);
  const assistant = get(json, 'flowAssistants.as-002-chat');
  assistant.id = `as-${id}-chat`;
  set(json, 'flowConfig.flowId', targetId.replace('B-', 'fb-'));
  set(json, `flowAssistants.as-${id}-chat`, assistant);
  set(json, 'flowNodes.n-001.assistantId', assistant.id);

  fs.writeJsonSync(paths.flow, json, { spaces: 2 });

  fs.unlinkSync(`${targetId}/ChitChat.md`);
  fs.createFileSync(`${targetId}/${upperFirst(camelCase(board.boardInfo.name))}.md`);
};

run();
