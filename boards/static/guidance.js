const fs = require('fs-extra');

const transcript = `Hi, in this video i'm going to show you the best way to start practicing designing apps and websites in figma
So in this video i'm going to give you step-by-step instructions you can literally follow click by click i'll only tell you the stuff that you need to get started designing interfaces 
So let's get started so we're going to be looking at a tool called figma and it has a few advantages one most importantly for you it's free to get started if you're working by yourself
we like using it at agn smart because it also has really good collaboration so we can have multiple people working on the same design file 
at the same time it's also really fast it works on any computer whether you have a mac or a pc or linux whatever you have it works right in the browser and it also has a mobile companion app so you can preview
your designs on a mobile screen so there are really no downsides to starting with a tool like figma as you're watching the video if you have any questions about how to do a particular effect in figma or any 
comment or something that you want to recommend please put it in the comments below and if you want to find out more tips about ui and ux make sure to subscribe to our free newsletter the link to that is in the description below
and it's a great resource for anyone starting an ui and ux so this is the website you just go to figma.com and i'm already signed in but you can
sign up very quickly even with your google account and get started but before we jump right into figma i want to show you the way i would recommend to
get started so you just want to start practicing`;

const run = async () => {
  const output = {
    transcriptLines: {},
    sceneAudios: {
      'audio-main': {
        duration: 0,
        fileName: 'modelZ.mp3',
        isMain: true,
        id: 'audio-main',
        url: 'https://raw.githubusercontent.com/dht/gdi-assets/main/tutorial/modelZ.mp3',
        timestamp: 0,
        projectTag: 'project-tutorial',
      },
    },
  };

  const lines = transcript.split('\n');
  let timestamp = 0;

  lines.forEach((line, index) => {
    timestamp += Math.ceil(Math.random() * 2000);

    output.transcriptLines[index] = {
      id: String(index),
      index,
      speakerName: '',
      text: line,
      textPhonetic: '',
      timestamp,
    };
  });

  fs.writeJsonSync('./guidance.json', output, { spaces: 2 });
};

run();
