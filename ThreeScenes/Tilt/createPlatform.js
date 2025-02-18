import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d';
import { THEME, physicsScaleRate } from '../../constants';

export const createPlatform = () => {
    let pos = {x: 0, y: 0, z: 0};
    let scale = {x: window.innerWidth, y: 15, z: window.innerHeight};
    
    const platformMaterial = new THREE.MeshLambertMaterial({
        color: THEME.colors.three.dpur,
        flatShading: true,
    });
    const platformGeometry = new THREE.BoxGeometry( scale.x, scale.y, scale.z );
    const platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);

    platformMesh.receiveShadow = true;
    const scaleRatio = 2;

    // Create the ground
    let collider = RAPIER.ColliderDesc.cuboid(
        scale.x / scaleRatio / physicsScaleRate,
        1 / physicsScaleRate,
        scale.z / scaleRatio / physicsScaleRate
    );
    let rigidBody = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
        pos.x / physicsScaleRate,
        pos.y / physicsScaleRate,
        pos.z / physicsScaleRate
    );

    return {mesh: platformMesh, rigidBody, collider};
}