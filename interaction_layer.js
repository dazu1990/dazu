import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { createGround } from './canvas_functions/createGround';
import {createLogo} from './canvas_functions/createLogo';

export const setupInteractionLayer = (canvasContainerElement) => {
  console.log('Setting up interaction layer');

  let camera, controls, scene, renderer;

  const init = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x13284a);
    scene.fog = new THREE.FogExp2(0x13284a, 0.0015);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    const amountObstacles = 3000;
    const obstacleDensity = 1.75;
    const obstacleArea = amountObstacles / obstacleDensity;

    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000,
    );
    camera.position.set(300, 200, 0);

  

    // controls

    controls = new OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents(window); // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 50;
    controls.maxDistance = 300;

    controls.maxPolarAngle = Math.PI / 2;

    // world

    const defaultMaterial = new THREE.MeshPhongMaterial({
      color: 0xf0af18,
      flatShading: true,
    });
    

    const obstacleOptions = [
      {
        type: 'cube',
        defaultGeometry: new THREE.BoxGeometry(10, 10, 10),
        defaultMaterial: defaultMaterial,
      },
      {
        type: 'sphere',
        defaultGeometry: new THREE.SphereGeometry(10, 32, 32),
        defaultMaterial: defaultMaterial,
      },
      {
        type: 'cone',
        defaultGeometry: new THREE.ConeGeometry(10, 30, 5, 1),
        defaultMaterial: defaultMaterial,
      },
      {
        type: 'cylinder',
        defaultGeometry: new THREE.CylinderGeometry(10, 10, 10, 32),
        defaultMaterial: defaultMaterial,
      },
      {
        type: 'torus',
        defaultGeometry: new THREE.TorusGeometry(10, 1, 16, 100),
        defaultMaterial: defaultMaterial,
      },
      {
        type: 'torusKnot',
        defaultGeometry: new THREE.TorusKnotGeometry(10, 1, 100, 16),
        defaultMaterial: defaultMaterial,
      },
      {
        type: 'tetrahedron',
        defaultGeometry: new THREE.TetrahedronGeometry(10),
        defaultMaterial: defaultMaterial,
      },
    ];

    const generateObstacle = () => {
      const obstacle =
        obstacleOptions[Math.floor(Math.random() * obstacleOptions.length)];

      let geometry;
      let material = defaultMaterial;

      const randMod = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };

      switch (obstacle.type) {
        case 'cube':
          geometry = new THREE.BoxGeometry(
            randMod(5, 10),
            randMod(5, 10),
            randMod(5, 10),
          );
          break;
        case 'sphere':
          geometry = new THREE.SphereGeometry(randMod(5, 10), 32, 32);
          break;
        case 'cone':
          geometry = new THREE.ConeGeometry(
            randMod(5, 10),
            randMod(5, 30),
            randMod(5, 15),
            1,
          );
          break;
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(
            randMod(5, 10),
            randMod(5, 10),
            randMod(5, 10),
            32,
          );
          break;
        case 'torus':
          geometry = new THREE.TorusGeometry(
            randMod(3, 10),
            randMod(1, 5),
            16,
            100,
          );
          break;
        case 'torusKnot':
          geometry = new THREE.TorusKnotGeometry(
            randMod(3, 10),
            randMod(1, 5),
            100,
            16,
          );
          break;
        case 'tetrahedron':
          geometry = new THREE.TetrahedronGeometry(10);
          break;
        default:
          geometry = new THREE.BoxGeometry(10, 10, 10);
      }

      const meshOutput = new THREE.Mesh(geometry, material);
      const scaleModifer = randMod(1, 2);
      meshOutput.scale.set(scaleModifer, scaleModifer, scaleModifer);

      return meshOutput;
    };

    const placeObstacle = (obstacleMesh) => {
      obstacleMesh.position.x = Math.random() * obstacleArea - obstacleArea / 2;
      obstacleMesh.position.y = 0;
      obstacleMesh.position.z = Math.random() * obstacleArea - obstacleArea / 2;

      obstacleMesh.rotation.x = Math.random() * 2 * Math.PI;
      obstacleMesh.rotation.y = Math.random() * 2 * Math.PI;
      obstacleMesh.updateMatrix();
      obstacleMesh.matrixAutoUpdate = false;

      scene.add(obstacleMesh);
    };

    // ground
    createGround(scene);

    // text
    createLogo(scene, camera);

    // create meshes


    for (let i = 0; i < amountObstacles; i++) {
      const obstacleMesh = generateObstacle();
      placeObstacle(obstacleMesh);

      scene.add(obstacleMesh);
    }

    // lights

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
    dirLight1.position.set(1, 1, 1);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x002288, 3);
    dirLight2.position.set(-1, -1, -1);
    scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(0x555555);
    scene.add(ambientLight);

    //

    window.addEventListener('resize', onWindowResize);
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const animate = () => {
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    render();
  };

  const render = () => {
    renderer.render(scene, camera);
  };

  init();
  //render(); // remove when using animation loop
};
