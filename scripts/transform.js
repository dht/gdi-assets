const fs = require('fs-extra');
const { get, set, clone } = require('lodash');

const run = async () => {
  const dirs = fs.readdirSync('../boards').filter((i) => i.startsWith('B-'));

  dirs.forEach((dir, index) => {
    tranformBoard(dir, index + 1);
  });
};

const loadBoard = (dir) => {
  const paths = {
    main: `../boards/${dir}/${dir}.json`,
    examples: `../boards/${dir}/${dir}.examples.json`,
    flow: `../boards/${dir}/${dir}.flow.json`,
    reviews: `../boards/${dir}/${dir}.reviews.json`,
  };

  const output = {
    id: '',
    paths,
    pathsOutput: {},
  };

  output.exists = {
    main: fs.existsSync(paths.main),
    examples: fs.existsSync(paths.examples),
    flow: fs.existsSync(paths.flow),
    reviews: fs.existsSync(paths.reviews),
  };

  output.mainData = output.exists.main ? fs.readJsonSync(paths.main) : null;
  output.examplesData = output.exists.examples ? fs.readJsonSync(paths.examples) : null;
  output.flowData = output.exists.flow ? fs.readJsonSync(paths.flow) : null;
  output.reviewsData = output.exists.reviews ? fs.readJsonSync(paths.reviews) : null;

  return output;
};

const parseBoard = (boardData) => {
  const output = { ...boardData };

  const id = get(boardData, 'mainData.id', null);
  const identifierFull = get(boardData, 'mainData.identifier', null);

  if (!identifierFull) {
    throw new Error('No identifier found');
  }

  const identifier = identifierFull.split('.').pop();

  output.id = id;
  output.identifierFull = identifierFull;
  output.identifier = identifier;
  output.seq = id.split('-').pop();

  output.pathsOutput = {
    root: `../boards/${identifierFull}`,
    main: `../boards/${identifierFull}/${identifier}.json`,
    examples: `../boards/${identifierFull}/${identifier}.examples.json`,
    flow: `../boards/${identifierFull}/${identifier}.flow.json`,
    reviews: `../boards/${identifierFull}/${identifier}.reviews.json`,
    index: `../boards/${identifierFull}/index.json`,
    log: '../boards/board.log.json',
  };

  return output;
};
const traverseBoard = (json, strIn, strOut) => {
  const traverse = (obj, strIn, strOut) => {
    Object.keys(obj ?? {}).forEach((key) => {
      const regex = new RegExp(strIn, 'g');
      const newKey = key.replace(regex, strOut);

      // Check if the value is an object and call traverse recursively
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[newKey] = traverse(obj[key], strIn, strOut); // Assign to newKey (might be the same as key)
      } else if (typeof obj[key] === 'string') {
        // Replace in string value
        obj[newKey] = obj[key].replace(regex, strOut);
      }

      // If newKey is different from key, delete the original key
      if (newKey !== key) {
        delete obj[key];
      }
    });
    return obj;
  };

  return traverse(json, strIn, strOut);
};

const setIf = (json, key, value) => {
  const currentValue = get(json, key, null);

  if (currentValue !== null) {
    set(json, key, value);
  }
};

const tranformBoard = (dir, index) => {
  const boardDataRaw = loadBoard(dir);
  const boardData = parseBoard(boardDataRaw);
  const { id, seq, identifier, identifierFull, exists, pathsOutput } = boardData;

  traverseBoard(boardData.mainData, id, '{boardId}');
  setIf(boardData.mainData, 'examplesUrl', `/${identifierFull}/${identifier}.examples.json`); // prettier-ignore
  setIf(boardData.mainData, 'flowUrl', `/${identifierFull}/${identifier}.flow.json`); // prettier-ignore
  traverseBoard(boardData.flowData, `fb-${seq}`, `fb-${identifier}`);
  traverseBoard(boardData.flowData, `as-${seq}`, `as-${identifier}`);
  set(boardData.mainData, 'boardInfo.index', '{index}');
  delete boardData.mainData.boardInfo.order;

  const { root, main, flow, examples } = pathsOutput;

  fs.ensureDirSync(root);

  if (exists.main) {
    fs.writeJsonSync(main, boardData.mainData, { spaces: 2 });
  }

  if (exists.examples) {
    fs.writeJsonSync(examples, boardData.examplesData, { spaces: 2 });
  }

  if (exists.flow) {
    fs.writeJsonSync(flow, boardData.flowData, { spaces: 2 });
  }

  fs.writeJsonSync(boardData.pathsOutput.index, { index }, { spaces: 2 });
  fs.writeJsonSync(boardData.pathsOutput.log, boardData, { spaces: 2 });
};

run();
