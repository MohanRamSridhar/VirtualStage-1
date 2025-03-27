const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter');
const { Scene, Group, Mesh, BoxGeometry, MeshStandardMaterial, Color } = require('three');

// Create a new scene
const scene = new Scene();

// Create the main stage group
const stageGroup = new Group();

// Main stage structure
const stageGeometry = new BoxGeometry(20, 1, 10);
const stageMaterial = new MeshStandardMaterial({
  color: new Color('#444444'),
  roughness: 0.8,
  metalness: 0.2
});
const stage = new Mesh(stageGeometry, stageMaterial);
stage.position.y = 0.5;
stageGroup.add(stage);

// Stage platform
const platformGeometry = new BoxGeometry(18, 0.1, 8);
const platformMaterial = new MeshStandardMaterial({
  color: new Color('#666666'),
  roughness: 0.9,
  metalness: 0.1
});
const platform = new Mesh(platformGeometry, platformMaterial);
platform.position.y = 0.6;
stageGroup.add(platform);

// Speakers
const speakerGeometry = new BoxGeometry(2, 3, 2);
const speakerMaterial = new MeshStandardMaterial({
  color: new Color('#222222'),
  roughness: 0.7,
  metalness: 0.3
});

// Left speaker
const leftSpeaker = new Mesh(speakerGeometry, speakerMaterial);
leftSpeaker.position.set(-8, 1.5, 0);
stageGroup.add(leftSpeaker);

// Right speaker
const rightSpeaker = new Mesh(speakerGeometry, speakerMaterial);
rightSpeaker.position.set(8, 1.5, 0);
stageGroup.add(rightSpeaker);

// Backdrop
const backdropGeometry = new BoxGeometry(20, 8, 0.1);
const backdropMaterial = new MeshStandardMaterial({
  color: new Color('#111111'),
  roughness: 0.9,
  metalness: 0.1
});
const backdrop = new Mesh(backdropGeometry, backdropMaterial);
backdrop.position.set(0, 4, -4.9);
stageGroup.add(backdrop);

// Stage effects
const effectsGeometry = new BoxGeometry(16, 0.1, 6);
const effectsMaterial = new MeshStandardMaterial({
  color: new Color('#ffffff'),
  roughness: 0.5,
  metalness: 0.5,
  transparent: true,
  opacity: 0.8
});
const effects = new Mesh(effectsGeometry, effectsMaterial);
effects.position.set(0, 0.7, 0);
stageGroup.add(effects);

// Add the stage group to the scene
scene.add(stageGroup);

// Export the scene as GLB
const exporter = new GLTFExporter();
exporter.parse(
  scene,
  (glb) => {
    // Save the GLB file
    const fs = require('fs');
    fs.writeFileSync('client/public/models/concert_stage.glb', Buffer.from(glb));
    console.log('Stage model generated successfully!');
  },
  (error) => {
    console.error('Error generating stage model:', error);
  }
); 