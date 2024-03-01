const fs = require('fs-extra');
const { get, set, mapValues } = require('lodash');

const run = async () => {
  console.log('1 ->', 1);
  const content = fs.readJsonSync('./modelz.json');

  content.assets = mapValues(content.assets, (asset) => {
    const { fileName } = asset;

    const filePath = `/tutorial/${fileName}.png`;

    return {
      ...asset,
      filePath,
      assetUrl: `https://raw.githubusercontent.com/dht/gdi-assets/main${filePath}`,
    };
  });

  content.sceneBits = mapValues(content.sceneBits, (bit) => {
    const { attachmentFilename, attachmentUrl } = bit;

    if (attachmentFilename) {
      bit.attachmentUrl = `https://raw.githubusercontent.com/dht/gdi-assets/main/tutorial/${attachmentFilename}`;
    }

    return bit;
  });

  content.sceneAudios = mapValues(content.sceneAudios, (audio) => {
    const { fileName } = audio;

    audio.url = `https://raw.githubusercontent.com/dht/gdi-assets/main/tutorial/${fileName}`;

    return audio;
  });

  fs.writeJsonSync('./modelz.out.json', content, { spaces: 2 });
};

run();
