const fs = require('fs');

const run = async () => {
  const source = 'b.jpg';

  fs.readdirSync('.')
    .filter((file) => file.match('_nx.png'))
    .forEach((file) => {
      const parts = file.split('_');
      const name = parts[0];

      ['nx', 'ny', 'nz', 'px', 'py', 'pz'].forEach((side) => {
        const dest = `${name}_${side}.jpg`;
        fs.copyFileSync(file, dest);
      });
    });
};

run();
