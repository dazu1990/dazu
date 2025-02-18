import RAPIER from '@dimforge/rapier3d';
import * as THREE from 'three';
import { THEME, physicsScaleRate } from '../../constants';

export const createSphere = (startX, startY, startZ) => {
  console.log('createSphere', startX, startY, startZ);
  let pos = { x: startX, y: startY, z: startZ };
  let radius = 20;

  const sphereMaterial = new THREE.MeshLambertMaterial({
    color: THEME.colors.three.org,
    flatShading: true,
  });
  const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  mesh.position.y = pos.y;

  mesh.receiveShadow = true;
  mesh.castShadow = true;

  // Create the physics body
  let rigidBody = RAPIER.RigidBodyDesc.dynamic().setTranslation(
    pos.x / physicsScaleRate,
    pos.y / physicsScaleRate,
    pos.z / physicsScaleRate
  ).setCcdEnabled(true); // Enable continuous collision detection

  let colliderBody = RAPIER.ColliderDesc.ball(radius / physicsScaleRate).setRestitution(0.8);

  return { mesh, rigidBody, colliderBody };
};
