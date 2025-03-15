import * as THREE from 'three';

import {
  debounce,
  initPhysics,
  isIos,
  isMobile,
  joinBodies,
  randNum,
} from '../../util';
import { createLogo } from './createLogo';
import { createPlatform } from './createPlatform';
import { createSphere } from './createSphere';
import { updateRotateGroup } from './updateRotateGroup';

import {
  THEME,
  logoHeight,
  maxSphereDiameter,
  physicsScaleRate,
  wallThickness,
} from '../../constants';

const debug = false;

export const initTilt = async (interactionDiv) => {
  const RAPIER = await initPhysics();
  const colors = THEME.colors.three;
  let resizeTimeout;

  let camera, scene, renderer, rotateGroup, clock;
  const mouse = { x: 0, y: 0, oldX: 0, oldY: 0, down: false };
  rotateGroup = new THREE.Group();

  let physicsWorld;

  let spheres = [];
  const numOfSpheres = isMobile()
    ? window.innerWidth / 2
    : (window.innerWidth / 2) * 1.25;

  let eventQueue;

  let platform, platformBody, platformCollider;

  let logoBodies = [];
  let logoColliders = [];

  let pointsGeo, pointsMaterial, points;

  let dirLight1;

  let disableTiltDetection = isIos() ? true : false;

  const init = async () => {
    await setupPhysicsWorld();
    setupGraphics();
    renderFrame();

    window.addEventListener(
      'resize',
      debounce(onWindowResize, 200, resizeTimeout),
    );

    window.addEventListener('mousemove', onMouseMove);
    interactionDiv.addEventListener('mousedown', onMouseDown);
    interactionDiv.addEventListener('mouseup', onMouseUp);

    window.addEventListener('orientationchange', onWindowResize);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    interactionDiv.addEventListener('touchstart', onTouchStart, {
      passive: true,
    });
    interactionDiv.addEventListener('touchend', onTouchEnd, { passive: true });

    document.addEventListener('fullscreenchange', onWindowResize);

    // Check if DeviceMotionEvent is supported
    if (typeof DeviceMotionEvent !== 'undefined') {
      // Listen for the devicemotion event
      window.addEventListener('devicemotion', handleMotion);
      console.log('devicemotion event listener added');
    } else {
      disableTiltDetection = true;
      console.log('DeviceMotion not supported');
    }
  };

  // Low-pass filter variables
  let alphaFiltered = 0;
  let betaFiltered = 0;
  let gammaFiltered = 0;
  const smoothingFactor = 0.1; // Adjust this value to control the smoothing

  // Handle the motion data
  const handleMotion = (event) => {
    if (disableTiltDetection) return;
    // Rotation rate
    const alpha = event.rotationRate.alpha; // Rotation around Z-axis
    const beta = event.rotationRate.beta; // Rotation around X-axis
    const gamma = event.rotationRate.gamma; // Rotation around Y-axis

    // Apply low-pass filter
    alphaFiltered = alphaFiltered + smoothingFactor * (alpha - alphaFiltered);
    betaFiltered = betaFiltered + smoothingFactor * (beta - betaFiltered);
    gammaFiltered = gammaFiltered + smoothingFactor * (gamma - gammaFiltered);

    // Update mouse position based on tilt
    mouse.x = betaFiltered / -90; // Normalize to [-1, 1]
    mouse.y = alphaFiltered / 90; // Normalize to [-1, 1]

    if (Math.abs(mouse.x) > 1 || Math.abs(mouse.y) > 1) {
      mouse.x = Math.sign(mouse.x) * 0.5;
      mouse.y = Math.sign(mouse.y) * 0.5;
    }

    updateRotateGroup(mouse, rotateGroup, platformBody);
  };

  const setupGraphics = () => {
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = colors.black;
    scene.fog = new THREE.Fog(
      0x000000,
      window.innerHeight * 1.1,
      window.innerHeight * 1.25,
    );

    camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      10000,
    );

    camera.position.set(0, window.innerHeight * 1.25, 0);
    camera.lookAt(0, 0, 0);

    dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
    dirLight1.position.set(500, window.innerHeight * 1.5, -500);
    scene.add(dirLight1);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    interactionDiv.appendChild(renderer.domElement);

    setupRotateGroup(
      platform,
      scene,
      physicsWorld,
      platformBody,
      platformCollider,
      camera,
      rotateGroup,
      logoBodies,
      logoColliders,
    );

    generateSpheres(true);

    if (debug) {
      setupPhysicsDebug();
    }
  };

  const setupRotateGroup = async () => {
    const platformData = createPlatform(RAPIER);

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

    createLogo(camera, RAPIER).then((logoGroup) => {
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

      logoBodies.forEach((logoBody) => {
        joinBodies(logoBody, platformBody, physicsWorld);
      });
    });
  };

  const setupPhysicsDebug = () => {
    pointsGeo = new THREE.BufferGeometry();
    pointsMaterial = new THREE.PointsMaterial({ vertexColors: true, size: 25 });
    renderDebugView();
    points = new THREE.Points(pointsGeo, pointsMaterial);
    scene.add(points);
  };

  const setupPhysicsWorld = async () => {
    physicsWorld = new RAPIER.World(new RAPIER.Vector3(0.0, -9.81, 0.0));
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

  const generateSpheres = (init) => {
    let sphereAmount = init ? numOfSpheres : 2;
    const maxSphereCount = isMobile() ? numOfSpheres * 1.5 : numOfSpheres * 2;
    const sphereBoundBuffer = wallThickness + maxSphereDiameter;
    const getPlatformBoundingBoxPoints = new THREE.Box3().setFromObject(
      platform.mesh,
    );
    const bounds = {
      x: {
        min: init
          ? getPlatformBoundingBoxPoints.min.x + sphereBoundBuffer
          : mouse.x * (window.innerWidth / 2) - sphereBoundBuffer,
        max: init
          ? getPlatformBoundingBoxPoints.max.x - sphereBoundBuffer
          : mouse.x * (window.innerWidth / 2) + sphereBoundBuffer,
      },
      z: {
        min: init
          ? getPlatformBoundingBoxPoints.min.z + sphereBoundBuffer
          : -mouse.y * (window.innerHeight / 2) - sphereBoundBuffer,
        max: init
          ? getPlatformBoundingBoxPoints.max.z - sphereBoundBuffer
          : -mouse.y * (window.innerHeight / 2) + sphereBoundBuffer,
      },
    };

    if (spheres.length < maxSphereCount) {
      for (let i = 0; i < sphereAmount; i++) {
        const x = randNum(bounds.x.min, bounds.x.max);
        const y = randNum(logoHeight / 2, logoHeight - 25);
        const z = randNum(bounds.z.min, bounds.z.max);

        let tempSphere = createSphere(x, y, z, RAPIER);
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
  const derotateDampingFactor = isMobile() ? 0.025 : 0.05;

  const derotate = () => {
    const dampingFactor = derotateDampingFactor; // Adjust this value to control the derotation speed

    const identityQuaternion = new THREE.Quaternion();
    rotateGroup.quaternion.slerp(identityQuaternion, dampingFactor);

    // Update the platform body's rotation to match the rotateGroup's quaternion
    const quaternion = rotateGroup.quaternion;
    platformBody.setRotation({
      w: quaternion.w,
      x: quaternion.x,
      y: quaternion.y,
      z: quaternion.z,
    });

    // Reset the rotation matrix to prevent accumulation
    rotateGroup.matrix.identity();
    rotateGroup.matrix.makeRotationFromQuaternion(rotateGroup.quaternion);
  };

  const onMouseDown = () => {
    mouse.down = true;
  };

  const onMouseUp = () => {
    mouse.down = false;
  };

  const onMouseMove = (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (mouse.down) {
      generateSpheres(false);
    }

    dirLight1.position.set(
      1000 * mouse.x,
      window.innerHeight * 1.5,
      -1000 * mouse.y,
    );
    dirLight1.lookAt(0, 0, 0);

    updateRotateGroup(mouse, rotateGroup, platformBody);
  };

  const onTouchStart = (event) => {
    mouse.down = true;
    const touch = event.touches[0];
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  };

  const onTouchEnd = () => {
    mouse.down = false;
  };

  const onTouchMove = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

    if (mouse.down) {
      generateSpheres(false);
    }

    dirLight1.position.set(
      1000 * mouse.x,
      window.innerHeight * 1.5,
      -1000 * mouse.y,
    );
    dirLight1.lookAt(0, 0, 0);

    if (disableTiltDetection) {
      updateRotateGroup(mouse, rotateGroup, platformBody);
    }
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // remove spheres
    spheres.forEach((sphere) => {
      physicsWorld.removeRigidBody(sphere.createdBody);
      scene.remove(sphere.mesh);
    });

    spheres = [];

    // Remove the old platform and logo group
    scene.remove(rotateGroup);
    rotateGroup.children = [];

    logoBodies = [];
    logoColliders = [];

    // remove from physics world
    physicsWorld.removeRigidBody(platformBody);
    physicsWorld.removeCollider(platformCollider);
    logoBodies.forEach((logoBody) => {
      physicsWorld.removeRigidBody(logoBody);
    });

    // Create a new platform and logo group
    setupRotateGroup();

    generateSpheres(true);
  };

  const animate = () => {
    const deltaTime = clock.getDelta();
    const maxDeltaTime = 1 / 60; // Cap at 60fps equivalent
    const actualDeltaTime = Math.min(deltaTime, maxDeltaTime);

    spheres.forEach((sphere) => {
      let position = sphere.createdBody.translation();
      sphere.mesh.position.set(
        position.x * physicsScaleRate,
        position.y * physicsScaleRate,
        position.z * physicsScaleRate,
      );

      if (sphere.mesh.position.y < -3200) {
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

      if (letter) {
        letter.matrixWorld.decompose(position, quaternion, scale);
      }

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

    // Apply derotation to rotateGroup
    if (mouse.down === false) {
      derotate();
    }

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

  await init();
};
