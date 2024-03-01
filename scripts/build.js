const fs = require('fs-extra');
const { get, set, clone } = require('lodash');

const copyFiles = {
  'assistants.json': 'allAssistants.json',
  'babylon.json': 'allBabylon.json',
  'capabilities.json': 'allCapabilities.json',
  'providers.json': 'allApiProviders.json',
  'videos.json': 'allVideos.json',
};

const run = async () => {
  const dirs = fs.readdirSync('./boards').filter((i) => i.startsWith('com.'));

  dirs.forEach((dir) => {
    tranformBoard(dir);
  });

  Object.keys(copyFiles).forEach((file) => {
    const sourcePath = `./boards/${file}`;
    const destPath = `./public/${copyFiles[file]}`;

    fs.copyFileSync(sourcePath, destPath);
  });

  createAllBoards();
};

const createAllBoards = () => {
  const output = {};
  const dirs = fs.readdirSync('./public/boards').filter((i) => i.startsWith('B-'));
  const future = fs.readJsonSync('./boards/future.json');

  let lastId;

  dirs.forEach((dir) => {
    const boardData = fs.readJsonSync(`./public/boards/${dir}/${dir}.json`);
    delete boardData['elements'];
    const id = boardData.id;
    output[id] = boardData;
    lastId = id;
  });

  let seq = parseInt(lastId.split('-').pop());

  Object.keys(future).forEach((key) => {
    const item = future[key];
    seq++;
    const id = `B-${lz(seq, 3)}`;
    set(item, 'id', id);
    set(item, 'url', `/boards/${id}`);
    set(item, 'boardInfo.index', seq);
    delete item.boardInfo.order;
    setIf(item, 'flowUrl', `/boards/${id}/${id}.flow.json`);
    setIf(item, 'examplesUrl', `/boards/${id}/${id}.examples.json`);
    set(item, 'sourceUrl', 'https://github.com/dht/gdi-assets/tree/main/boards');

    output[id] = item;
  });

  fs.writeJsonSync('./public/allBoards.json', output, { spaces: 2 });
};

const loadBoard = (dir) => {
  const identifier = dir.split('.').pop();

  const paths = {
    main: `./boards/${dir}/${identifier}.json`,
    examples: `./boards/${dir}/${identifier}.examples.json`,
    flow: `./boards/${dir}/${identifier}.flow.json`,
    reviews: `./boards/${dir}/${identifier}.reviews.json`,
    index: `./boards/${dir}/index.json`,
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
  output.indexData = fs.readJsonSync(paths.index);

  setIf(output.mainData, 'examplesUrl', '/{boardId}/{boardId}.examples.json');
  setIf(output.mainData, 'flowUrl', '/{boardId}/{boardId}.flow.json');
  fs.writeJsonSync(paths.main, output.mainData, { spaces: 2 });

  return output;
};

const lz = (str, width) => {
  return '0'.repeat(width - str.toString().length) + str;
};

const parseBoard = (boardData) => {
  const output = { ...boardData };

  const identifierFull = get(boardData, 'mainData.identifier', null);
  const index = get(boardData, 'indexData.index', null);
  const id = `B-${lz(index, 3)}`;

  if (!identifierFull) {
    throw new Error('No identifier found');
  }

  const identifier = identifierFull.split('.').pop();

  output.id = id;
  output.index = index;
  output.identifierFull = identifierFull;
  output.identifier = identifier;

  output.pathsOutput = {
    root: `./public/boards/${id}`,
    main: `./public/boards/${id}/${id}.json`,
    examples: `./public/boards/${id}/${id}.examples.json`,
    flow: `./public/boards/${id}/${id}.flow.json`,
    reviews: `./public/boards/${id}/${id}.reviews.json`,
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

const tranformBoard = (dir) => {
  const boardDataRaw = loadBoard(dir);

  const boardData = parseBoard(boardDataRaw);
  const { id, seq, index, identifier, identifierFull, exists, pathsOutput } = boardData;

  traverseBoard(boardData.mainData, '{boardId}', id);
  set(boardData.mainData, 'boardInfo.index', index);
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

  fs.writeJsonSync('./log.json', boardData, { spaces: 2 });
};

run();
