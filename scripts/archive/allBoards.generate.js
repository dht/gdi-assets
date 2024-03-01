const fs = require('fs');
const json = require('./allBoards.json');

const OpenAI = require('openai');
const _ = require('lodash');
const { set } = require('lodash');

// dotenv
const dotenv = require('dotenv');
dotenv.config();

// const categories = fs.readFileSync('./categories.md', 'utf8').split('\n').join(',');

if (fs.existsSync('output')) {
  fs.rmdirSync('output', { recursive: true });
}

fs.mkdirSync('output');

const API_KEY = process.env.OPEN_AI_API_KEY;

const init = (apiKey) => {
  instance = new OpenAI({
    apiKey,
  });
};

const partial = json.slice(0, 3);

// gpt-3.5-turbo-16k-0613
const chatCompletion = async (messages, model = 'gpt-3.5-turbo') => {
  let response;

  try {
    console.time('OpenIA api call');
    response = await instance.chat.completions.create({
      model,
      messages,
    });
    console.timeEnd('OpenIA api call');
  } catch (err) {
    console.log('err =>', err);
    throw err;
  }

  return response.choices[0].message.content;
};

const str = (obj) => JSON.stringify(obj, null, 2);

const api = (instruction) => {
  return chatCompletion([
    {
      role: 'system',
      content: `create a new app json according to this existing app definition ${str(
        json[0]
      )}".\n`,
    },
    {
      role: 'user',
      content: instruction,
    },
  ]);
};

const shorten = (text) => {
  return chatCompletion([
    {
      role: 'user',
      content: `shorten (less than 60 characters): ${text}`,
    },
  ]);
};

const getCategories = () => {
  const output = [];

  Object.keys(fiverr).forEach((l1) => {
    const subcategories = fiverr[l1];

    Object.keys(subcategories).forEach((l2) => {
      const values = subcategories[l2];

      values.forEach((value) => {
        output.push([l1, l2, value].join(' > '));
      });
    });
  });

  return output;
};

const buildInstructions = (app) => {
  return `new app description: ${app.description}`;
};

const maxRunningRequests = 5;
const requests = [];

const step = () => {
  const runningRequests = requests.filter((request) => request.isRunning).length;

  const isDone = requests.every((request) => request.isDone);

  if (isDone) {
    console.log('All done!');
    process.exit(0);
  }

  if (runningRequests >= maxRunningRequests) {
    return;
  }

  for (let i = 0; i < maxRunningRequests - runningRequests; i++) {
    const request = requests.find((request) => !request.isDone && !request.isRunning);

    if (!request) {
      return;
    }

    console.log(`Running request ${request.index}...`);
    request.isRunning = true;

    api(request.instructions)
      .then((response) => {
        console.log(`Done request ${request.index}...`);
        request.isDone = true;
        request.isRunning = false;
        fs.writeFileSync(`output/${request.index}.out.json`, response);
      })
      .catch((error) => {
        console.log(`Error request ${request.index}...`);
        request.isDone = true;
        request.isRunning = false;
        request.error = error;
        console.log('error =>', error);
      });
  }
};

const runQueue = async () => {
  setInterval(() => {
    step();
  }, 1000);
};

const newApps = [
  {
    description:
      'an app named travis that uses Apple Vision Pro augmented reality headset to plan and build a 3D structure, be that a house or a chemical compound',
  },
  {
    description:
      'an app that thinks of ideas for other apps, builds a JSON file to describe the app, and then plans it',
  },
];

const run = async () => {
  init(API_KEY);
  let i = 0;

  for (app of newApps) {
    const instructions = buildInstructions(app);
    requests.push({
      index: i++,
      instructions,
      isDone: false,
      isRunning: false,
    });
  }

  runQueue();
};

const lz = (number, min = 3) => {
  return `${number}`.padStart(min, '0');
};

const parse = () => {
  const output = [];

  json.forEach((item, index) => {
    const order = index + 1;
    const id = `B-${lz(order)}`;

    set(item, 'id', id);
    set(item, 'boardInfo.order', order);
    set(item, 'flowUrl', `/${id}/${id}.flow.json`);
    set(item, 'sourceUrl', `https://github.com/dht/gdi-assets/tree/main/boards/${id}`);

    output.push(item);
  });

  fs.writeFileSync('AllBoards.out.json', JSON.stringify(output, null, 2));
};
parse();
// run();
