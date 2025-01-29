import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { createGround } from './canvas_functions/createGround';
import {createLogo} from './canvas_functions/createLogo';
import {createObstacles} from './canvas_functions/createObstacles';
import { THEME } from './constants';

export const setupInteractionLayer = () => {
  console.log('Setting up interaction layer');

  const colors = THEME.colors.three;

  let camera, controls, scene, renderer, composer;

  const init = () => {
    scene = new THREE.Scene();
    scene.background = colors.pur;
    scene.fog = new THREE.Fog( colors.pur, 1, 1100 );
    // scene.fog = new THREE.FogExp2(0x13284a, 0.0015);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);



    const lightDirection = { x: 1, y: 1, z: 1 };



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
    controls.maxDistance = 325;
    // controls.maxDistance = 30000;

    controls.maxPolarAngle = Math.PI / 2;

    // world

    const bloomParams = {
      threshold: 0,
      strength: 1,
      radius: 0.5,
      exposure: 1
    };

    // Create a render pass for the scene
    const renderPass = new RenderPass(scene, camera);

    // Create an UnrealBloomPass for bloom effect
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = bloomParams.bloomThreshold;
    bloomPass.strength = bloomParams.bloomStrength;
    bloomPass.radius = bloomParams.bloomRadius;

    // Create an EffectComposer for post-processing
    composer = new EffectComposer(renderer);
    composer.addPass(renderPass); // Add the render pass
    composer.addPass(bloomPass); // Add the bloom pass
    composer.addPass(new OutputPass()); // Add the output pass


    // ground
    createGround(scene, lightDirection);

    // DAZU text
    createLogo(scene, camera);

    // obstacles
    createObstacles(scene);
    

    // lights
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
    dirLight1.position.set(lightDirection.x, lightDirection.y, lightDirection.z);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(THEME.colors.three.pur, 3);
    dirLight2.position.set(-1, -1, -1);
    scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(THEME.colors.three.org, 0.5);
    scene.add(ambientLight);

    //

    window.addEventListener('resize', onWindowResize);
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);

  };

  const animate = () => {
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    render();
    
  };

  const render = () => {
    composer.render();
    renderer.render(scene, camera);
  };

  init();
  //render(); // remove when using animation loop
};
