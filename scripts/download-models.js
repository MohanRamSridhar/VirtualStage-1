import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models = [
  {
    name: 'audience_seated.glb',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Soldier.glb'
  },
  {
    name: 'audience_standing.glb',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Soldier.glb'
  },
  {
    name: 'audience_vip.glb',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Soldier.glb'
  }
];

const modelsDir = path.join(__dirname, '../public/models');

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

function downloadModel(model) {
  const file = fs.createWriteStream(path.join(modelsDir, model.name));
  
  https.get(model.url, response => {
    if (response.statusCode === 200) {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${model.name}`);
      });
    } else {
      console.error(`Failed to download ${model.name}: Status code ${response.statusCode}`);
    }
  }).on('error', err => {
    fs.unlink(path.join(modelsDir, model.name), () => {});
    console.error(`Error downloading ${model.name}:`, err.message);
  });
}

// Download all models
models.forEach(downloadModel); 