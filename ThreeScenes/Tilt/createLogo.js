import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { THEME, physicsScaleRate, logoHeight, maxSphereDiameter } from '../../constants';

export const createLogo = (camera, RAPIER) => {
  let textGroup = new THREE.Group();
  let text = ['D', 'A', 'Z', 'U'],
    bevelEnabled = true,
    font = undefined;

  // get window ratio
  const windowRatio = window.innerWidth / window.innerHeight;
  const isPortrait = windowRatio < 1.095;
  console.log('isPortrait', isPortrait);

  console.log('windowRatio', windowRatio);

  const depth = maxSphereDiameter * 1.25,
    size = (window.innerWidth * 0.3) / 2,
    curveSegments = 2,
    bevelThickness = 0.2,
    bevelSize = 0.2,
    yFloatHeight = logoHeight;

  const themeColors = THEME.colors.three;

  const defaultTextMaterial = new THREE.MeshToonMaterial({
    color: themeColors.org,
    emissive: themeColors.org,
    emissiveIntensity: 0.75,
  });

  const loadFont = () => {
    return new Promise((resolve, reject) => {
      const loader = new FontLoader();
      loader.load(
        '/fonts/Climate_Crisis/Climate Crisis_Regular.json', // Ensure this path is correct
        (response) => {
          font = response;
          resolve();
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });
  };

  const createText = () => {
    text.forEach((letter, i) => {
      let textGeo = new TextGeometry(letter, {
        font: font,
        size: size,
        depth: depth,
        curveSegments: curveSegments,
        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelEnabled: bevelEnabled,
      });

      textGeo.computeBoundingBox();

      const centerXOffset =
        (-0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x)) / 2;

      const centerYOffset =
        -0.5 * (textGeo.boundingBox.max.y - textGeo.boundingBox.min.y);

      let textMesh = new THREE.Mesh(textGeo, defaultTextMaterial);
      const paddingMultiplier = 0.2;

      // Set position based on the index
      switch (i) {
        case 0:
          // top-left corner - D
          textMesh.position.x = -((window.innerWidth * paddingMultiplier) - centerXOffset);
          textMesh.position.z = isPortrait ? -(window.innerHeight * paddingMultiplier) - centerYOffset * (2 * windowRatio) : -(window.innerHeight * paddingMultiplier) - centerYOffset;
          break;
        case 1:
          // Top-right corner - A
          textMesh.position.x = window.innerWidth * paddingMultiplier + centerXOffset * 3;
          textMesh.position.z = isPortrait ? -(window.innerHeight * paddingMultiplier) - centerYOffset * (2 * windowRatio) : -(window.innerHeight * paddingMultiplier) - centerYOffset;
          break;

        case 2:
          // Bottom-left corner - Z
          textMesh.position.x = -((window.innerWidth * paddingMultiplier) - centerXOffset);
          textMesh.position.z = isPortrait ? window.innerHeight * windowRatio * paddingMultiplier : window.innerHeight * paddingMultiplier - centerYOffset;
          break;
        case 3:
          // bottom-right corner - U
          textMesh.position.x = window.innerWidth * paddingMultiplier + centerXOffset * 3;
          textMesh.position.z = isPortrait ? window.innerHeight * windowRatio * paddingMultiplier : window.innerHeight * paddingMultiplier - centerYOffset;
          break;
      }

      textMesh.position.y = yFloatHeight;
      // textMesh.castShadow = true;

      textMesh.rotation.x = camera.rotation.x;
      textMesh.castShadow = true;
      textMesh.receiveShadow = true;

      // Create the physics body and collider for the letter
      const vertices = [];
      const indices = [];

      textGeo.attributes.position.array.forEach((v) => {
        vertices.push(v / physicsScaleRate);
      });

      if (textGeo.index !== null && textGeo.index !== undefined) {
        for (let i = 0; i < textGeo.index.count; i++) {
          indices.push(textGeo.index.array[i]);
        }
      } else {
        // Handle non-indexed geometry
        for (let i = 0; i < vertices.length / 3; i++) {
          indices.push(i);
        }
      }

      let collider = RAPIER.ColliderDesc.trimesh(vertices, indices);

      let rigidBody = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
        textMesh.position.x / physicsScaleRate,
        textMesh.position.y / physicsScaleRate,
        textMesh.position.z / physicsScaleRate
      ).setRotation({
        x: textMesh.quaternion.x,
        y: textMesh.quaternion.y,
        z: textMesh.quaternion.z,
        w: textMesh.quaternion.w,
      });

      textMesh.userData.rigidBody = rigidBody;
      textMesh.userData.collider = collider;

      textGroup.add(textMesh);
    });
    return textGroup;
  };
  textGroup.userData.name = 'logoGroup';

  return loadFont().then(createText);
};
