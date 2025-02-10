import RAPIER from '@dimforge/rapier3d';
import * as THREE from 'three';

export const createSphere = (physicsScaleRate) => {
  let pos = { x: 0, y: 20, z: 0 };
  let radius = 2;

  const sphereMaterial = new THREE.MeshLambertMaterial({
    color: 0x000000,
    flatShading: true,
  });
  const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  mesh.position.y = pos.y;

  mesh.receiveShadow = true;

  // Create the physics body
  let rigidBody = RAPIER.RigidBodyDesc.dynamic().setTranslation(
    pos.x,
    pos.y,
    pos.z,
  );

  let colliderBody = RAPIER.ColliderDesc.ball(radius/physicsScaleRate).setRestitution(.8);


  return { mesh, rigidBody, colliderBody };
};
