import RAPIER from '@dimforge/rapier3d';
import * as THREE from 'three';
import { THEME, physicsScaleRate } from '../../constants';
import { randNum } from '../../util';
import { rand } from 'three/tsl';

export const createSphere = (startX, startY, startZ) => {
  // console.log('createSphere', startX, startY, startZ);
  let pos = { x: startX, y: startY, z: startZ };
  let radius = randNum(10, 25);

  const colors = [
    THEME.colors.three.org, 
    THEME.colors.three.pur, 
    THEME.colors.three.grn, 
    THEME.colors.three.dgrn, 
    THEME.colors.three.brwn, 
    THEME.colors.three.dpur
  ];
  const sphereMaterials = colors.map((color) => {
    return new THREE.MeshLambertMaterial({
      color: color,
      flatShading: true,
    });
  }
  );
  const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterials[randNum(0, colors.length - 1)]);
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
