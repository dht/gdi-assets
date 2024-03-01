const fs = require('fs');

const run = async () => {
  const json = JSON.parse(fs.readFileSync('./db.hovercraft.json', 'utf8'));

  json.dots = json.dots.sort(sortBy('timestamp')).map((dot, index) => {
    dot.id = String(index + 1);
    return dot;
  });

  fs.writeFileSync('./db.hovercraft.json', JSON.stringify(json, null, 2), 'utf8');
};

const sortBy = (key) => (a, b) => {
  if (a[key] < b[key]) return -1;
  if (a[key] > b[key]) return 1;
  return 0;
};

run();
