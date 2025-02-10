import RAPIER from '@dimforge/rapier3d';
import * as THREE from 'three';
import { THEME, physicsScaleRate } from '../../constants';

export const createSphere = (startX,startZ) => {
  console.log('createSphere', startX, startZ);
  let pos = { x: startX, y: 20, z: startZ };
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
    pos.x/physicsScaleRate,
    pos.y,
    pos.z/physicsScaleRate,
  );

  let colliderBody = RAPIER.ColliderDesc.ball(radius/physicsScaleRate).setRestitution(.8);


  return { mesh, rigidBody, colliderBody };
};
