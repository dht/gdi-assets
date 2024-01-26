const fs = require('fs-extra');

const transcript = `Artificial intelligence is making rapid strides
There's talk of a new evolution that could fundamentally change life on our planet 
Artificial intelligence has the potential to revolutionize every aspect of daily life work mobility medicine the economy and communication
But will ai really make medicine better and doctors superfluous
When will self-driving cars hit our roads?
Will intelligent robots usurp our jobs?
and are we heading for a dystopia with no privacy and total surveillance?
What exactly is artificial intelligence and how much can it really do what will change and what will remain pure fantasy?
To answer these questions we embarked on an exciting journey to meet the scientists working on our future in the us britain germany and china
Our first stop silicon valley in California
Apple, Google and Facebook all have their headquarters here
It's the epicenter of the digital revolution
The tech industry has changed the face of the San Francisco Bay area
New startup companies launch every day
Rents have exploded and artificial intelligence is the buzzword
A new type of supermarket recently opened its doors here Amazon Go all you need here is an app
`;

const run = async () => {
  const output = {
    transcriptLines: {},
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

  fs.writeJsonSync('./rhetoric.json', output, { spaces: 2 });
};

run();
