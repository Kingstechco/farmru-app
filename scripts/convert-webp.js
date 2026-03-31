const sharp = require('sharp');
const path = require('path');

const files = ['farmru_leaf', 'farmru_abstract', 'farmru_soil', 'farmru_weather_bg', 'farmru_harvest'];
const dir = path.join(__dirname, '..', 'assets', 'images');

Promise.all(
  files.map(name =>
    sharp(path.join(dir, `${name}.png`))
      .webp({ quality: 80, effort: 4 })
      .toFile(path.join(dir, `${name}.webp`))
      .then(info => console.log(`✓ ${name}.webp — ${(info.size / 1024).toFixed(1)} KB`))
  )
).then(() => console.log('All done!')).catch(e => console.error(e));
