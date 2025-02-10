import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d';
import { THEME } from '../../constants';


export const createPlatform = () => {
    // TO DO : match the platform size with the rigid body size
    const platformHeight = 5;

    let pos = {x: 0, y: -(platformHeight/2), z: 0};
    let scale = {x: window.innerWidth, y: platformHeight, z: window.innerHeight};
    
    const platformMaterial = new THREE.MeshLambertMaterial({
        color: THEME.colors.three.dpur,
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