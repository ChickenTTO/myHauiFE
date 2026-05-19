const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  if (file.endsWith('.jsx')) {
    fs.renameSync(file, file.replace(/\.jsx$/, '.tsx'));
  } else if (file.endsWith('.js')) {
    fs.renameSync(file, file.replace(/\.js$/, '.ts'));
  }
});
console.log('Renamed all files!');
