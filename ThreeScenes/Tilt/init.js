import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


import { createLogo } from './createLogo';
import { createPlatform } from './createPlatform';
import { createSphere } from './createSphere';

import { THEME, physicsScaleRate } from '../../constants';

const debug = true;

export const initTilt = () => {
  console.log('Tilt scene');
  const colors = THEME.colors.three;

  let camera, scene, renderer, rotateGroup, clock;
  const mouse = { x: 0, y: 0, oldX: 0, oldY: 0, down: false };
  rotateGroup = new THREE.Group();

  let physicsWorld;
 

  let spheres = [];
  const numOfSpheres = 40;

  let controls;
  let eventQueue;

  let platform, platformBody, platformCollider;

  let logo, logoBodies = [], logoColliders = [];

  let pointsGeo, pointsMaterial, points;

  const init = () => {
    // tmpTrans = new Ammo.btTransform();

    setupPhysicsWorld();
    setupGraphics();
    renderFrame();

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);
  };
  const setupGraphics = () => {
    // clock for timing
    clock = new THREE.Clock();

    // Create a new Three.js scene
    scene = new THREE.Scene();
    // scene.background = new THREE.Color('#AAAAAA');
    scene.background = colors.pur;
    // scene.fog = new THREE.Fog(colors.pur, -300, 0);

    //camera
    camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      10000,
    );
    // debug angle
    // camera.position.set(0, 5, 50);
    // camera.position.set(0, 50, window.innerHeight*1.25);
    camera.position.set(0, 1000, 0);
    camera.lookAt(0, 0, 0);

    

    //lights
    const lightDirection = { x: 1, y: 1, z: 1 };
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
    dirLight1.position.set(
      lightDirection.x,
      lightDirection.y,
      lightDirection.z,
    );
    // dirLight1.castShadow = true;

    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(THEME.colors.three.pur, 3);
    dirLight2.position.set(-1, -1, -1);

    scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(THEME.colors.three.org, 0.5);
    scene.add(ambientLight);

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    // Controls
    // controls = new OrbitControls(camera, renderer.domElement);
    // controls.listenToKeyEvents(window); // optional
    // controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    // controls.dampingFactor = 0.05;
    // controls.screenSpacePanning = false;
    // controls.minDistance = 50;
    // controls.maxDistance = 325;

    // Add objects to the scene

    // DAZU text
    logo = createLogo(scene, camera);
    rotateGroup.add(logo);
    console.log('Logo', logo);
    
    
    // Adding platform setup logic to ensure platform is initialized after logo
    platform = createPlatform(scene);
    const getPlatformBoundingBoxPoints = new THREE.Box3().setFromObject(platform.mesh);
    // console.log('Platform bounding box', getPlatformBoundingBoxPoints);


    // create Objects
    // TO DO: stagger the creation of the spheres
    for (let i = 0; i < numOfSpheres; i++) {
      const x = Math.random() * (getPlatformBoundingBoxPoints.max.x - getPlatformBoundingBoxPoints.min.x) + getPlatformBoundingBoxPoints.min.x;
      const y = Math.random() * (100 - 20) + 20;
      const z =  Math.random() * (getPlatformBoundingBoxPoints.max.z - getPlatformBoundingBoxPoints.min.z) + getPlatformBoundingBoxPoints.min.z;
      let tempSphere = createSphere(x,y,z);
      tempSphere.createdBody = physicsWorld.createRigidBody(tempSphere.rigidBody);
      tempSphere.createdCollider = physicsWorld.createCollider(tempSphere.colliderBody, tempSphere.createdBody);
      spheres.push(tempSphere);
      scene.add(tempSphere.mesh);
    }
    
    console.log(physicsWorld);

    rotateGroup.add(platform.mesh);
    scene.add(rotateGroup);

    platformBody = physicsWorld.createRigidBody(platform.rigidBody);
    platformCollider = physicsWorld.createCollider(platform.collider, platformBody)


    // Debug points 
    if(debug){
      setupPhysicsDebug();
    }
  };

  const setupPhysicsDebug = () => {
    pointsGeo = new THREE.BufferGeometry();
    pointsMaterial = new THREE.PointsMaterial({ vertexColors: true, size: 15 });
    renderDebugView();
    points = new THREE.Points(pointsGeo, pointsMaterial);
    scene.add(points);
  };


  const setupPhysicsWorld = () => {
    const earthGravity =  9.81;
    let gravity = { x: 0.0, y: -(earthGravity), z: 0.0 };
    physicsWorld = new RAPIER.World(gravity);
    eventQueue = new RAPIER.EventQueue(true); // Initialize the event queue


  };
  
  const renderDebugView = () => {
    const {vertices, colors } = physicsWorld.debugRender();
    pointsGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    pointsGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    // pointsGeo.setAttribute( 'size', new THREE.BufferAttribute( 10, 1 ) );
  }


  const updateRotateGroup = () => {
    const deltaX = mouse.x - mouse.oldX;
    const deltaY = mouse.y - mouse.oldY;
  
    // Create quaternions for the rotations around the x and y axes
    const quaternionX = new THREE.Quaternion();
    const quaternionZ = new THREE.Quaternion();
  
    // Set the quaternions based on the mouse delta values
    quaternionX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * 0.35); // Rotation around x-axis
    quaternionZ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), deltaX * 0.35); // Rotation around z-axis
  
    // Multiply the current quaternion by the new quaternions
    rotateGroup.quaternion.multiplyQuaternions(quaternionX, rotateGroup.quaternion);
    rotateGroup.quaternion.multiplyQuaternions(quaternionZ, rotateGroup.quaternion);
  
    // Update the platform body's rotation to match the rotateGroup's quaternion
    const quaternion = rotateGroup.quaternion;
    platformBody.setRotation({ w: quaternion.w, x: quaternion.x, y: quaternion.y, z: quaternion.z });
  
    // Update the old mouse position
    mouse.oldX = mouse.x;
    mouse.oldY = mouse.y;
  };

  const onMouseDown = (event) => {
    event.preventDefault();
    // console.log('Mouse down', mouse);
    mouse.down = true;
  };
  const onMouseUp = (event) => {
    event.preventDefault();
    // console.log('Mouse up', mouse);
    mouse.down = false;
    mouse.oldX = mouse.x;
    mouse.oldY = mouse.y;
  };
  const onMouseMove = (event) => {
    event.preventDefault();
    if (mouse.down) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      updateRotateGroup();
    //   console.log('Mouse move', mouse);
    }
    
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const animate = () => {
    const deltaTime = clock.getDelta();

    spheres.forEach((sphere) => {
      let position = sphere.createdBody.translation();
      sphere.mesh.position.set(
        position.x * physicsScaleRate,
        position.y * physicsScaleRate,
        position.z * physicsScaleRate
      );

      if (sphere.mesh.position.y < -1200) {
        spheres.splice(spheres.indexOf(sphere), 1);
        physicsWorld.removeRigidBody(sphere.createdBody);
        scene.remove(sphere.mesh);
      }
    });

    renderFrame();
    physicsWorld.step(eventQueue, deltaTime, 10, 1 / 240);
    if (debug) renderDebugView();
  };

  const renderFrame = () => {

    renderer.render(scene, camera);
  };

    init();
};
