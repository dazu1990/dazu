import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { THEME } from '../../constants';

export const createLogo = (scene, camera) => {
  let textGroup = new THREE.Group();
  let text = ['D', 'A', 'Z', 'U'],
    bevelEnabled = true,
    font = undefined;

  const depth = 5,
    size = (window.innerWidth * 0.35) / 2,
    // size = ((window.innerWidth/10 )* 0.35) / 2,

    curveSegments = 2,
    bevelThickness = 0.2,
    bevelSize = 0.2;

  const themeColors = THEME.colors.three;

  const defaultTextMaterial = new THREE.MeshPhongMaterial({
    color: themeColors.org,
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
       ( -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x))/2;

        const centerYOffset =
        -0.5 * (textGeo.boundingBox.max.y - textGeo.boundingBox.min.y);
    

      let textMesh = new THREE.Mesh(textGeo, defaultTextMaterial);
      const paddingMultiplier = 0.2;
    //   let widthlimit = (window.innerWidth * 0.25) / 2;
    //   let heightlimit = (window.innerHeight * 0.2) / 2;

      // // Set position based on the index
      switch (i) {
        case 0:
          // top-left corner - D
          textMesh.position.x = -((window.innerWidth * paddingMultiplier) - centerXOffset)*1.5;
          textMesh.position.z = -(window.innerHeight * paddingMultiplier) - centerYOffset;
          break;
        case 1:
          // Top-right corner - A
          textMesh.position.x = (window.innerWidth * paddingMultiplier) + centerXOffset;
          textMesh.position.z = -(window.innerHeight * paddingMultiplier) - centerYOffset;
          break;

        case 2:
          // Bottom-left corner - Z
          textMesh.position.x = -((window.innerWidth * paddingMultiplier) - centerXOffset)*1.5;
          textMesh.position.z = (window.innerHeight * paddingMultiplier) - centerYOffset;
          break;
        case 3:
            // bottom-right corner - U
            textMesh.position.x = (window.innerWidth * paddingMultiplier) + centerXOffset;
            textMesh.position.z = (window.innerHeight * paddingMultiplier) - centerYOffset;
          
          break;
      }

      // textMesh.position.x = centerOffset;
      // textMesh.position.y = 0;
      textMesh.position.y = 0;
      console.log(textMesh.position);

      textMesh.rotation.x = camera.rotation.x;
    //   textMesh.rotation.y = camera.rotation.y;
    //   textMesh.rotation.z = camera.rotation.z;

    //   textMesh.lookAt(camera.position);

      textGroup.add(textMesh);

    });
    // for (let i = 0; i < textGroup.children.length; i++) {
    //     textGroup.children[i].lookAt(camera.position);
    // }

    // scene.add(textGroup);
  };
  loadFont();

  return textGroup;
};
