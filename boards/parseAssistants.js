const fs = require('fs');
const _ = require('lodash');

const lz = (number, min = 3) => {
  return `${number}`.padStart(min, '0');
};

const run = async () => {
  const allAssistants = fs.readFileSync('./allAssistants.csv', 'utf8');

  // csv to json
  const output = allAssistants
    .split('\n')
    .splice(1)
    .map((line) => {
      const [nameRaw, promptRaw] = line.split(',');

      const name = nameRaw.replace(/^"/g, '').replace(/"$/g, '');
      const prompt = promptRaw.replace(/^"/g, '').replace(/"$/g, '');

      const id = _.kebabCase(name);

      return {
        id,
        name,
        prompt,
      };
    });

  const outputPath = './allAssistants.json';
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
};

run();
