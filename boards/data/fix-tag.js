const fs = require('fs-extra');
const { get, set, mapValues } = require('lodash');

const run = async () => {
  const content = fs.readJsonSync('./park-expanse.json');

  const projectTag = 'project-park';

  [
    'sceneCameras',
    'sceneLights',
    'sceneBits',
    'sceneMeshes',
    'scenePacks',
    'sceneVASPs',
    'sceneDots',
    'sceneExternals',
    'sceneAudios',
    'sceneEffects',
  ].forEach((key) => {
    content[key] = mapValues(content[key], (item) => {
      item.projectTag = projectTag;
      return item;
    });
  });

  fs.writeJsonSync('./park-expanse.out.json', content, { spaces: 2 });
};

run();
