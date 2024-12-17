import * as THREE from 'three';

export const createGround = (scene) => {
  const groundGeometry = new THREE.PlaneGeometry(10000, 10000);
  const groundMaterial = new THREE.MeshPhongMaterial({
    color: 0x999999,
    depthWrite: false,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);
};
