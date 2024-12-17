import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

export const createLogo = (scene, camera) => {
  let textGroup = new THREE.Group();
  let text = ['D', 'A', 'Z', 'U'],
    bevelEnabled = true,
    font = undefined;

  const depth = 5,
    size = 90,
    curveSegments = 2,
    bevelThickness = 0.2,
    bevelSize = 0.2;

  const defaultTextMaterial = new THREE.MeshPhongMaterial({
    color: 0xff00ff,
    flatShading: true,
  });

  const loadFont = () => {
    const loader = new FontLoader();
    loader.load(
      'fonts/Climate_Crisis/Climate Crisis_Regular.json',
      function (response) {
        font = response;
        createText();
      },
    );
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
        -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

      let textMesh = new THREE.Mesh(textGeo, defaultTextMaterial);
      let widthlimit = (window.innerWidth * 0.25) / 2;
      let heightlimit = (window.innerHeight * 0.2) / 2;

      // // Set position based on the index
      switch (i) {
        case 0:
          // bottom-left corner - D
          textMesh.position.x = widthlimit;
          textMesh.position.z = heightlimit - centerXOffset;
          break;
        case 1:
          // Top-left corner - Z
          textMesh.position.x = -widthlimit - centerXOffset;
          textMesh.position.z = heightlimit - centerXOffset;
          break;

        case 2:
          // Top-right corner - A
          textMesh.position.x = -widthlimit - centerXOffset;
          textMesh.position.z = -heightlimit + centerXOffset;
          break;
        case 3:
          // Bottom-right corner - U
          textMesh.position.x = widthlimit;
          textMesh.position.z = -heightlimit - centerXOffset;
          break;
      }

      // textMesh.position.x = centerOffset;
      // textMesh.position.y = 0;
      textMesh.position.y = 0;
      console.log(textMesh.position);

      // textMesh.rotation.x = camera.rotation.x;
      // textMesh.rotation.y = camera.rotation.y;
      // textMesh.rotation.z = camera.rotation.z;

      textMesh.lookAt(camera.position);

      textGroup.add(textMesh);
    });

    scene.add(textGroup);
  };
  loadFont();
};
