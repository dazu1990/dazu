import RAPIER from '@dimforge/rapier3d';
import * as THREE from 'three';

import { createLogo } from './createLogo';
import { createPlatform } from './createPlatform';
import { createSphere } from './createSphere';

import { THEME, logoHeight, physicsScaleRate, wallThickness, maxSphereDiameter, windowHeight } from '../../constants';
import { randNum } from '../../util';

const debug = true;

export const initTilt = (interactionDiv) => {
  console.log('Tilt scene');
  const colors = THEME.colors.three;

  let camera, scene, renderer, rotateGroup, clock;
  const mouse = { x: 0, y: 0, oldX: 0, oldY: 0, down: false };
  rotateGroup = new THREE.Group();

  let physicsWorld;

  let spheres = [];
  const numOfSpheres = 900;

  let controls;
  let eventQueue;

  let platform, platformBody, platformCollider;
  let walls = [];
  let wallBodies = [];

  let logo,
    logoBodies = [],
    logoColliders = [];

  let pointsGeo, pointsMaterial, points;

  const init = () => {
    setupPhysicsWorld();
    setupGraphics();
    renderFrame();

    window.addEventListener('resize', onWindowResize);
    // document.addEventListener('mousedown', onMouseDown);
    // document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onClick);
  };

  const setupGraphics = () => {
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = colors.black;

    camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / windowHeight,
      1,
      10000,
    );

    // TO DO: set camera position relative to window height
    camera.position.set(0, windowHeight * 1.5, 0);
    // camera.position.set(0, windowHeight *1.3, 500);

    camera.lookAt(0, 0, 0);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
    dirLight1.position.set(
      500,
      windowHeight * 1.5,
      -500
    );
    scene.add(dirLight1);

    // const dirLight2 = new THREE.DirectionalLight(THEME.colors.three.pur, 3);
    // dirLight2.position.set(-1, -1, -1);
    // scene.add(dirLight2);

    // const ambientLight = new THREE.AmbientLight(THEME.colors.three.pur, 0.5);
    // scene.add(ambientLight);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, windowHeight);
    renderer.setAnimationLoop(animate);
    interactionDiv.appendChild(renderer.domElement);

    // Add objects to the scene

    platform = createPlatform(scene);
    

    const platformData = createPlatform(scene);

    platform = {
      mesh: platformData.mesh,
      rigidBody: platformData.rigidBody,
      collider: platformData.collider,
    };

    platformBody = physicsWorld.createRigidBody(platform.rigidBody);

    platformCollider = physicsWorld.createCollider(
      platform.collider,
      platformBody,
    );

    rotateGroup.add(platform.mesh);
    scene.add(rotateGroup);

    console.log('platformData', platformData);

    createLogo(camera).then((logoGroup) => {
      rotateGroup.add(logoGroup);
      logoGroup.children.forEach((letter) => {
        const letterBody = physicsWorld.createRigidBody(
          letter.userData.rigidBody,
        );
        const letterCollider = physicsWorld.createCollider(
          letter.userData.collider,
          letterBody,
        );
        logoBodies.push(letterBody);
        logoColliders.push(letterCollider);
      });
      scene.add(rotateGroup);

      // Join each logoBody with platformBody
      logoBodies.forEach((logoBody) => {
        joinBodies(logoBody, platformBody);
      });
    });

    generateSpheres();

    if (debug) {
      setupPhysicsDebug();
    }

    // controls = new OrbitControls(camera, renderer.domElement);
  };

  const generateSpheres = () => {
    if (spheres.length < 2000) {
      const getPlatformBoundingBoxPoints = new THREE.Box3().setFromObject(
        platform.mesh,
      );
      const sphereBoundBuffer = (wallThickness + maxSphereDiameter);
      for (let i = 0; i < numOfSpheres; i++) {
        const x = randNum(
          getPlatformBoundingBoxPoints.min.x + sphereBoundBuffer,
          getPlatformBoundingBoxPoints.max.x - sphereBoundBuffer,
        );
        const y = randNum(logoHeight / 2, logoHeight - 25);
        const z = randNum(
          getPlatformBoundingBoxPoints.min.z + sphereBoundBuffer,
          getPlatformBoundingBoxPoints.max.z - sphereBoundBuffer,
        );
        // const z = Math.random() * (getPlatformBoundingBoxPoints.max.z - getPlatformBoundingBoxPoints.min.z) + getPlatformBoundingBoxPoints.min.z;
        let tempSphere = createSphere(x, y, z);
        tempSphere.createdBody = physicsWorld.createRigidBody(
          tempSphere.rigidBody,
        );
        tempSphere.createdCollider = physicsWorld.createCollider(
          tempSphere.colliderBody,
          tempSphere.createdBody,
        );
        spheres.push(tempSphere);
        scene.add(tempSphere.mesh);
      }
    }
    
  };

  const joinBodies = (body1, body2) => {
    const jointData = RAPIER.JointData.fixed(
      { x: 0.0, y: 0.0, z: 0.0 },
      { w: 1.0, x: 0.0, y: 0.0, z: 0.0 },
      { x: 0.0, y: -2.0, z: 0.0 },
      { w: 1.0, x: 0.0, y: 0.0, z: 0.0 },
    );
    physicsWorld.createImpulseJoint(jointData, body1, body2, true);
  };

  const setupPhysicsDebug = () => {
    pointsGeo = new THREE.BufferGeometry();
    pointsMaterial = new THREE.PointsMaterial({ vertexColors: true, size: 25 });
    renderDebugView();
    points = new THREE.Points(pointsGeo, pointsMaterial);
    scene.add(points);
  };
  

  const setupPhysicsWorld = () => {
    const earthGravity = 9.81;
    let gravity = { x: 0.0, y: -earthGravity, z: 0.0 };
    
    // Create physics world
    physicsWorld = new RAPIER.World(gravity);
    
    // Try to set parameters after creation
    try {
      // Newer Rapier versions might use this
      physicsWorld.setSolverIterations(6);
      physicsWorld.setPredictionDistance(0.01 * physicsScaleRate);
    } catch (e) {
      console.log("Could not set physics parameters directly, trying alternative method");
      try {
        // Alternative approach
        const params = physicsWorld.getIntegrationParameters();
        if (params) {
          params.numSolverIterations = 6;
          params.predictionDistance = 0.01 * physicsScaleRate;
        }
      } catch (e2) {
        console.log("Could not set physics parameters: ", e2);
      }
    }
    
    eventQueue = new RAPIER.EventQueue(true);
  };

  const renderDebugView = () => {
    const { vertices, colors } = physicsWorld.debugRender();
    pointsGeo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    pointsGeo.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors, 3),
    );
  };

  const updateRotateGroup = () => {
    const maxRotationSpeed = 0.5; // Adjust this value as needed

    // Calculate deltas with clamping
    const deltaX = Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, mouse.x - mouse.oldX));
    const deltaY = Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, mouse.y - mouse.oldY));

    // Create quaternions for the rotations around the x and y axes
    const quaternionX = new THREE.Quaternion();
    const quaternionZ = new THREE.Quaternion();
    

    // Set the quaternions based on the mouse delta values
    quaternionX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * 0.35); // Rotation around x-axis
    quaternionZ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), deltaX * 0.35); // Rotation around z-axis

    // Multiply the current quaternion by the new quaternions
    rotateGroup.quaternion.multiplyQuaternions(
      quaternionX,
      rotateGroup.quaternion,
    );
    rotateGroup.quaternion.multiplyQuaternions(
      quaternionZ,
      rotateGroup.quaternion,
    );

    // Update the platform body's rotation to match the rotateGroup's quaternion
    const quaternion = rotateGroup.quaternion;
    platformBody.setRotation({
      w: quaternion.w,
      x: quaternion.x,
      y: quaternion.y,
      z: quaternion.z,
    });


    // Update the old mouse position
    mouse.oldX = mouse.x;
    mouse.oldY = mouse.y;
  };

  const onClick = (event) => {
    event.preventDefault();
    generateSpheres();
  }

  // const onMouseDown = (event) => {
  //   event.preventDefault();
  //   mouse.down = true;
  //   mouse.oldX = mouse.x;
  //   mouse.oldY = mouse.y;
  // };

  // const onMouseUp = (event) => {
  //   event.preventDefault();
  //   mouse.down = false;
  //   // mouse.oldX = mouse.x;
  //   // mouse.oldY = mouse.y;
  //   mouse.oldX = 0;
  //   mouse.oldY = 0;
  // };

  const onMouseMove = (event) => {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / windowHeight) * 2 + 1;
    // if (mouse.down) {
      updateRotateGroup();
    // }
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / windowHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, windowHeight);
  };

  const animate = () => {
    const deltaTime = clock.getDelta();
    const maxDeltaTime = 1/60; // Cap at 60fps equivalent
    const actualDeltaTime = Math.min(deltaTime, maxDeltaTime);

    spheres.forEach((sphere) => {
      let position = sphere.createdBody.translation();
      sphere.mesh.position.set(
        position.x * physicsScaleRate,
        position.y * physicsScaleRate,
        position.z * physicsScaleRate,
      );

      if (sphere.mesh.position.y < -1200) {
        spheres.splice(spheres.indexOf(sphere), 1);
        physicsWorld.removeRigidBody(sphere.createdBody);
        scene.remove(sphere.mesh);
      }
    });
    // Update logoBodies to match the position and rotation of rotateGroup
    logoBodies.forEach((logoBody, index) => {
      const letter = rotateGroup.children[1].children[index];
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();

      // console.log('letter', letter);

      letter.matrixWorld.decompose(position, quaternion, scale);

      logoBody.setTranslation({
        x: position.x / physicsScaleRate,
        y: position.y / physicsScaleRate,
        z: position.z / physicsScaleRate,
      });

      logoBody.setRotation({
        x: quaternion.x,
        y: quaternion.y,
        z: quaternion.z,
        w: quaternion.w,
      });
    });

    // More accurate physics stepping with sub-steps
    const numSubsteps = 3; // Increase for better accuracy, decrease for performance
    const subDelta = actualDeltaTime / numSubsteps;
    
    for (let i = 0; i < numSubsteps; i++) {
        physicsWorld.step(eventQueue, subDelta);
    }

    renderFrame();
    if (debug) renderDebugView();
  };

  const renderFrame = () => {
    renderer.render(scene, camera);
  };

  init();
};
