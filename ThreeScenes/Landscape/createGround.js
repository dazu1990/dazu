import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import {THEME} from '../../constants';

const generateHeight = (width, height) => {
  const heightAmplitude = 0.25; // Amplitude of the height data

  // Seed for the random number generator
  let seed = Math.PI / 4;

  // Custom random function using the seed
  window.Math.random = function () {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // Calculate the size of the height data array
  const size = width * height,
    data = new Uint8Array(size); // Array to store height data

  // Create an instance of ImprovedNoise for Perlin noise generation
  const perlin = new ImprovedNoise(),
    z = Math.random() * 100; // Random z value for the noise function

  let quality = 1; // Initial quality factor

  // Loop to generate height data with increasing quality
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < size; i++) {
      const x = i % width, // Calculate x coordinate
        y = ~~(i / width); // Calculate y coordinate (~~ is a faster Math.floor)

      // Add Perlin noise value to the height data
      data[i] += Math.abs(
        perlin.noise(x / quality, y / quality, z) * quality * heightAmplitude,
      );
    }

    // Increase quality factor for the next iteration
    quality *= 5;
  }

  return data; // Return the generated height data
};

const generateTexture = (data, width, height) => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // Get the 2D drawing context of the canvas
  const context = canvas.getContext('2d');
  context.fillStyle = '#000'; // Set the initial fill color to black
  context.fillRect(0, 0, width, height); // Fill the canvas with the color

  // Get the image data from the context
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const imageData = image.data;

  // Variables for shading calculations
  const vector3 = new THREE.Vector3();
  const sun = new THREE.Vector3(1, 1, 1).normalize();
  let shade;

  // Fill the image data with height values and apply shading
  for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
    vector3.x = data[j - 2] - data[j + 2]; // Calculate x gradient
    vector3.y = 2; // Fixed y value for shading
    vector3.z = data[j - width * 2] - data[j + width * 2]; // Calculate z gradient
    vector3.normalize(); // Normalize the vector

    shade = vector3.dot(sun); // Calculate the dot product for shading

    // Apply shading to the image data with a different color scheme
    imageData[i] = (65 + shade * 219) * (0.5 + data[j] * 0.007); // Red channel
    imageData[i + 1] = (42 + shade * 145) * (0.5 + data[j] * 0.007); // Green channel
    imageData[i + 2] = (92 + shade * 42) * (0.5 + data[j] * 0.007); // Blue channel
  }

  // Put the modified image data back into the context
  context.putImageData(image, 0, 0);

  // Create a new canvas to scale up the texture
  const canvasScaled = document.createElement('canvas');
  canvasScaled.width = width * 4;
  canvasScaled.height = height * 4;

  // Get the 2D drawing context of the scaled canvas
  const contextScaled = canvasScaled.getContext('2d');
  contextScaled.scale(4, 4); // Scale the context
  contextScaled.drawImage(canvas, 0, 0); // Draw the original canvas onto the scaled canvas

  // Get the image data from the scaled context
  const imageScaled = contextScaled.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
  const imageDataScaled = imageScaled.data;

  // Add random noise to the scaled image data
  for (let i = 0, l = imageDataScaled.length; i < l; i += 4) {
    const v = ~~(Math.random() * 5); // Generate a random value between 0 and 4
    imageDataScaled[i] += v; // Red channel
    imageDataScaled[i + 1] += v; // Green channel
    imageDataScaled[i + 2] += v; // Blue channel
  }

  // Put the modified image data back into the scaled context
  contextScaled.putImageData(imageScaled, 0, 0);

  // Return the scaled canvas
  return canvasScaled;
};

// Function to create the ground plane and add it to the scene
export const createGround = (scene, lightDirection) => {
  let mesh, texture;

  // Define the width and depth(depth of the plane geometry. This determines the resolution of the terrain mesh ) of the world
  const worldWidth = 256,
    // worldDepth = 256;
    worldDepth = 100;

  // Generate height data for the terrain
  const data = generateHeight(worldWidth, worldDepth);

  // Create a plane geometry with the specified width, depth, and segments
  const geometry = new THREE.PlaneGeometry(
    1000, // Width of the plane
    1000, // Depth of the plane
    worldWidth - 1, // Number of width segments
    worldDepth - 1, // Number of depth segments
  );

  // Rotate the plane to lie flat on the ground
  geometry.rotateX(-Math.PI / 2);

  // Access the vertices of the geometry
  const vertices = geometry.attributes.position.array;

  // Scaling factor for the height data
  const scalingFactor = 2;

  // Modify the y-coordinates of the vertices based on the height data
  for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
    vertices[j + 1] = data[i] * scalingFactor;
  }

  // Create a texture from the height data
  texture = new THREE.CanvasTexture(
    generateTexture(data, worldWidth, worldDepth, lightDirection),
  );
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  // Create a mesh with the geometry and texture
  mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ map: texture }),
  );

  // Set the position of the mesh
  mesh.position.y = -(worldDepth / 2) + 20; // Ensure the ground plane is at y = 0

  // Add the mesh to the scene
  scene.add(mesh);
};

// Helper functions (generateHeight and generateTexture) should be defined here or imported
