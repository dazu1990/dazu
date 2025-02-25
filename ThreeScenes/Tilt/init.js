import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { createLogo } from './createLogo';
import { createPlatform } from './createPlatform';
import { createSphere } from './createSphere';

import { THEME, physicsScaleRate } from '../../constants';
import { randNum } from '../../util';
import { rand } from 'three/webgpu';

const debug = true;

export const initTilt = () => {
  console.log('Tilt scene');
  const colors = THEME.colors.three;

  let camera, scene, renderer, rotateGroup, clock;
  const mouse = { x: 0, y: 0, oldX: 0, oldY: 0, down: false };
  rotateGroup = new THREE.Group();

  let physicsWorld;

  let spheres = [];
  const numOfSpheres = 1000;

  let controls;
  let eventQueue;

  let platform, platformBody, platformCollider;

  let logo, logoBodies = [], logoColliders = [];

  let pointsGeo, pointsMaterial, points;

  const init = () => {
    setupPhysicsWorld();
    setupGraphics();
    renderFrame();

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);
  };

  const setupGraphics = () => {
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = colors.pur;

    camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      10000,
    );
    camera.position.set(0, 1000, 0);
    // camera.position.set(0, 50, 1000);

    camera.lookAt(0, 0, 0);


    const lightDirection = { x: 1, y: 1, z: 1 };
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
    dirLight1.position.set(
      lightDirection.x,
      lightDirection.y,
      lightDirection.z,
    );
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(THEME.colors.three.pur, 3);
    dirLight2.position.set(-1, -1, -1);
    scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(THEME.colors.three.org, 0.5);
    scene.add(ambientLight);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    // Add objects to the scene

    platform = createPlatform(scene);
    const getPlatformBoundingBoxPoints = new THREE.Box3().setFromObject(platform.mesh);

    platformBody = physicsWorld.createRigidBody(platform.rigidBody);
    platformCollider = physicsWorld.createCollider(platform.collider, platformBody);

    rotateGroup.add(platform.mesh);
    scene.add(rotateGroup);

    
    createLogo(scene, camera, physicsWorld).then((logoGroup) => {
      rotateGroup.add(logoGroup);
      logoGroup.children.forEach((letter) => {
        const letterBody = physicsWorld.createRigidBody(letter.userData.rigidBody);
        const letterCollider = physicsWorld.createCollider(letter.userData.collider, letterBody);
        logoBodies.push(letterBody);
        logoColliders.push(letterCollider);
      });
      scene.add(rotateGroup);

      // Join each logoBody with platformBody
      logoBodies.forEach((logoBody) => {
        joinBodies(logoBody, platformBody);
      });
    });

    for (let i = 0; i < numOfSpheres; i++) {
      const x = randNum(getPlatformBoundingBoxPoints.min.x, getPlatformBoundingBoxPoints.max.x);
      const y = randNum(250, 350);
      const z = randNum(getPlatformBoundingBoxPoints.min.z, getPlatformBoundingBoxPoints.max.z);
      // const z = Math.random() * (getPlatformBoundingBoxPoints.max.z - getPlatformBoundingBoxPoints.min.z) + getPlatformBoundingBoxPoints.min.z;
      let tempSphere = createSphere(x, y, z);
      tempSphere.createdBody = physicsWorld.createRigidBody(tempSphere.rigidBody);
      tempSphere.createdCollider = physicsWorld.createCollider(tempSphere.colliderBody, tempSphere.createdBody);
      spheres.push(tempSphere);
      scene.add(tempSphere.mesh);
    }

    if (debug) {
      setupPhysicsDebug();
    }

    // controls = new OrbitControls(camera, renderer.domElement);

  };

  const joinBodies = (body1, body2) => {
    const jointData = RAPIER.JointData.fixed(
      { x: 0.0, y: 0.0, z: 0.0 }, { w: 1.0, x: 0.0, y: 0.0, z: 0.0 },
      { x: 0.0, y: -2.0, z: 0.0 }, { w: 1.0, x: 0.0, y: 0.0, z: 0.0 }
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
    let gravity = { x: 0.0, y: -(earthGravity), z: 0.0 };
    physicsWorld = new RAPIER.World(gravity);
    eventQueue = new RAPIER.EventQueue(true);
  };

  const renderDebugView = () => {
    const { vertices, colors } = physicsWorld.debugRender();
    pointsGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    pointsGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  };

  const updateRotateGroup = () => {
    const deltaX = mouse.x - mouse.oldX;
    const deltaY = mouse.y - mouse.oldY;

    const quaternionX = new THREE.Quaternion();
    const quaternionZ = new THREE.Quaternion();

    quaternionX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * 0.35);
    quaternionZ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), deltaX * 0.35);

    rotateGroup.quaternion.multiplyQuaternions(quaternionX, rotateGroup.quaternion);
    rotateGroup.quaternion.multiplyQuaternions(quaternionZ, rotateGroup.quaternion);

    const quaternion = rotateGroup.quaternion;
    platformBody.setRotation({ w: quaternion.w, x: quaternion.x, y: quaternion.y, z: quaternion.z });

    mouse.oldX = mouse.x;
    mouse.oldY = mouse.y;
  };

  const onMouseDown = (event) => {
    event.preventDefault();
    mouse.down = true;
  };

  const onMouseUp = (event) => {
    event.preventDefault();
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
    // Update logoBodies to match the position and rotation of rotateGroup
    logoBodies.forEach((logoBody, index) => {
      const letter = rotateGroup.children[1].children[index];
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();

      console.log('letter', letter);

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

    renderFrame();
    physicsWorld.step(eventQueue, deltaTime, 10, 1 / 240);
    if (debug) renderDebugView();
  };

  const renderFrame = () => {
    renderer.render(scene, camera);
  };

  init();
};
