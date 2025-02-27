import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { THEME, physicsScaleRate } from '../../constants';

export const createLogo = (scene, camera, physicsWorld) => {
  let textGroup = new THREE.Group();
  let text = ['D', 'A', 'Z', 'U'],
    bevelEnabled = true,
    font = undefined;

  const depth = 100,
    size = (window.innerWidth * 0.35) / 2,
    curveSegments = 2,
    bevelThickness = 0.2,
    bevelSize = 0.2;

  const themeColors = THEME.colors.three;

  const defaultTextMaterial = new THREE.MeshPhongMaterial({
    color: themeColors.org,
    flatShading: true,
  });

  const loadFont = () => {
    return new Promise((resolve, reject) => {
      const loader = new FontLoader();
      loader.load(
        'fonts/Climate_Crisis/Climate Crisis_Regular.json',
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
    console.log('createText');
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
          textMesh.position.x = -((window.innerWidth * paddingMultiplier) - centerXOffset) * 1.5;
          textMesh.position.z = -(window.innerHeight * paddingMultiplier) - centerYOffset;
          break;
        case 1:
          // Top-right corner - A
          textMesh.position.x = (window.innerWidth * paddingMultiplier) + centerXOffset;
          textMesh.position.z = -(window.innerHeight * paddingMultiplier) - centerYOffset;
          break;

        case 2:
          // Bottom-left corner - Z
          textMesh.position.x = -((window.innerWidth * paddingMultiplier) - centerXOffset) * 1.5;
          textMesh.position.z = (window.innerHeight * paddingMultiplier) - centerYOffset;
          break;
        case 3:
          // bottom-right corner - U
          textMesh.position.x = (window.innerWidth * paddingMultiplier) + centerXOffset;
          textMesh.position.z = (window.innerHeight * paddingMultiplier) - centerYOffset;
          break;
      }

      textMesh.position.y = 15;
      textMesh.castShadow = true;

      textMesh.rotation.x = camera.rotation.x;

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

      console.log('textGeo:', letter + '', textGeo);

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

  return loadFont().then(createText);
};
