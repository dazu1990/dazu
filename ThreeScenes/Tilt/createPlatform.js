import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d';


export const createPlatform = () => {

    const platformHeight = 5;

    let pos = {x: 0, y: -(platformHeight/2), z: 0};
    // let scale = {x: window.innerWidth, y: platformHeight, z: window.innerHeight};
    // let scale = {x: window.innerWidth/10, y: platformHeight, z: window.innerHeigh/10};

    let scale = {x: 10, y: platformHeight, z: 10};


    const platformMaterial = new THREE.MeshLambertMaterial({
        color: 0xEEEEEEE,
        flatShading: true,
    });
    const platformGeometry = new THREE.BoxGeometry( scale.x, scale.y, scale.z );
    const platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);
    platformMesh.position.y = pos.y;

    platformMesh.receiveShadow = true;

    // Create the ground
    let collider = RAPIER.ColliderDesc.cuboid(scale.x/2, scale.y/2, scale.z/2);
    let rigidBody = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation((pos.x), (pos.y), pos.z);

    return {mesh: platformMesh, rigidBody, collider};
}