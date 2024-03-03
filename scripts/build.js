const fs = require('fs-extra');
const { get, set } = require('lodash');

const SOURCE = './src';
const DEST = './boards';

const copyFiles = {
  'assistants.json': 'allAssistants.json',
  'babylon.json': 'allBabylon.json',
  'capabilities.json': 'allCapabilities.json',
  'providers.json': 'allApiProviders.json',
  'videos.json': 'allVideos.json',
};

const order = fs.readJsonSync(`${SOURCE}/order.json`);

const run = async () => {
  const dirs = fs.readdirSync(SOURCE).filter((i) => i.startsWith('com.'));

  dirs.forEach((dir) => {
    transformBoard(dir);
  });

  Object.keys(copyFiles).forEach((file) => {
    const sourcePath = `${SOURCE}/${file}`;
    const destPath = `${DEST}/${copyFiles[file]}`;

    fs.copyFileSync(sourcePath, destPath);
  });

  createAllBoards();
};

const createAllBoards = () => {
  const output = {};
  const dirs = fs.readdirSync(`${DEST}`).filter((i) => i.startsWith('B-'));
  const future = fs.readJsonSync(`${SOURCE}/future.json`);

  let lastId;

  dirs.forEach((dir) => {
    const boardData = fs.readJsonSync(`${DEST}/${dir}/${dir}.json`);
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

  fs.writeJsonSync(`${DEST}/allBoards.json`, output, { spaces: 2 });
};

const loadBoard = (dir) => {
  const identifier = dir.split('.').pop();

  const paths = {
    main: `${SOURCE}/${dir}/${identifier}.json`,
    examples: `${SOURCE}/${dir}/${identifier}.examples.json`,
    flow: `${SOURCE}/${dir}/${identifier}.flow.json`,
    reviews: `${SOURCE}/${dir}/${identifier}.reviews.json`,
    index: `${SOURCE}/${dir}/index.json`,
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

const lz = (str, width) => {
  return '0'.repeat(width - str.toString().length) + str;
};

const parseBoard = (boardData) => {
  const output = { ...boardData };

  const identifierFull = get(boardData, 'mainData.identifier', null);
  const index = order.findIndex((i) => i === identifierFull) + 1;
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
    root: `${DEST}/${id}`,
    main: `${DEST}/${id}/${id}.json`,
    examples: `${DEST}/${id}/${id}.examples.json`,
    flow: `${DEST}/${id}/${id}.flow.json`,
    reviews: `${DEST}/${id}/${id}.reviews.json`,
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

const transformBoard = (dir) => {
  const boardDataRaw = loadBoard(dir);

  const boardData = parseBoard(boardDataRaw);
  const { id, index, exists, pathsOutput, identifier } = boardData;

  traverseBoard(boardData.mainData, '{boardId}', id);
  traverseBoard(boardData.mainData, '{identifier}', identifier);
  set(boardData.mainData, 'boardInfo.index', index);
  const { root, main, flow, examples } = pathsOutput;

  fs.removeSync(root);
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

  const mdPath = `${DEST}/${id}/z_${identifier}.md`;
  fs.writeFileSync(mdPath, '');

  fs.writeJsonSync('./log.json', boardData, { spaces: 2 });
};

run();
