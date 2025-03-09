import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d';
import { THEME, physicsScaleRate } from '../../constants';

export const createPlatform = () => {
    let pos = {x: 0, y: 0, z: 0};
    let scale = {x: window.innerWidth, y: 15, z: window.innerHeight};
    const baseHeight = 100;
    
    const platformMaterial = new THREE.MeshLambertMaterial({
        color: THEME.colors.three.dpur,
        flatShading: true,
    });


    const baseGeometry = new THREE.BoxGeometry(scale.x, baseHeight, scale.z);
    const wallThickness = 30;
    const wallHeight = scale.y * 20;
    const wallGeometry = new THREE.BoxGeometry(scale.x + (wallThickness * 2), wallHeight, wallThickness);

    const baseMesh = new THREE.Mesh(baseGeometry, platformMaterial);
    baseMesh.position.set(pos.x, pos.y - (baseHeight/2), pos.z);
    baseMesh.receiveShadow = true;

    // Create walls
    const wallMaterial = new THREE.MeshToonMaterial({
        color: THEME.colors.three.pur,
        flatShading: true,
    });

    const walls = [];

    const wallYPos = (pos.y + wallHeight / 2) - (baseHeight / 2);

    // Front wall
    const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
    frontWall.position.set(pos.x, wallYPos, pos.z - scale.z / 2 - wallThickness / 2);
    frontWall.castShadow = true;
    walls.push(frontWall);

    // Back wall
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(pos.x, wallYPos, pos.z + scale.z / 2 + wallThickness / 2);
    backWall.castShadow = true;
    walls.push(backWall);

    // Left wall
    const leftWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, scale.z);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(pos.x - scale.x / 2 - wallThickness / 2, wallYPos, pos.z);
    leftWall.castShadow = true;
    walls.push(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    rightWall.position.set(pos.x + scale.x / 2 + wallThickness / 2, wallYPos, pos.z);
    rightWall.castShadow = true;
    walls.push(rightWall);

    const scaleRatio = 2;

    const platformGroup = new THREE.Group();
    platformGroup.add(baseMesh);
    walls.forEach((wall) => platformGroup.add(wall));

    // Create the ground collider
    let collider = RAPIER.ColliderDesc.cuboid(
        scale.x / scaleRatio / physicsScaleRate,
        baseHeight / physicsScaleRate,
        scale.z / scaleRatio / physicsScaleRate
    );
    let rigidBody = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
        pos.x / physicsScaleRate,
        (pos.y)/ physicsScaleRate,
        pos.z / physicsScaleRate
    );

     // Create wall colliders
     const wallColliders = walls.map((wall) => {
        const wallScale = wall.geometry.parameters;
        return RAPIER.ColliderDesc.cuboid(
            wallScale.width / 2 / physicsScaleRate,
            wallScale.height / 2 / physicsScaleRate,
            wallScale.depth / 2 / physicsScaleRate
        ).setTranslation(
            wall.position.x / physicsScaleRate,
            wall.position.y / physicsScaleRate,
            wall.position.z / physicsScaleRate
        );
    });
    console.log('wallColliders:', wallColliders);

    return {mesh: platformGroup, rigidBody, collider, wallColliders};
}