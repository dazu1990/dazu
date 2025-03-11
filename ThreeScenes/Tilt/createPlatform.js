import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import { THEME, physicsScaleRate, wallThickness } from '../../constants';

export const createPlatform = () => {
    let pos = {x: 0, y: 0, z: 0};
    let scale = {x: window.innerWidth, y: 15, z: window.innerHeight};
    const baseHeight = 100;
    
    const platformMaterial = new THREE.MeshLambertMaterial({
        color: THEME.colors.three.dpur,
        flatShading: true,
    });

    const baseGeometry = new THREE.BoxGeometry(scale.x, baseHeight, scale.z);
    baseGeometry.translate(pos.x, pos.y - baseHeight / 2, pos.z);
    const wallHeight = scale.y * 20;

    const wallGeometries = [];

    // Front wall
    const frontWallGeometry = new THREE.BoxGeometry(scale.x + (wallThickness * 2), wallHeight, wallThickness);
    frontWallGeometry.translate(pos.x, (pos.y + wallHeight / 2) - (baseHeight / 2), pos.z - scale.z / 2 - wallThickness / 2);
    wallGeometries.push(frontWallGeometry);

    // Back wall
    const backWallGeometry = new THREE.BoxGeometry(scale.x + (wallThickness * 2), wallHeight, wallThickness);
    backWallGeometry.translate(pos.x, (pos.y + wallHeight / 2) - (baseHeight / 2), pos.z + scale.z / 2 + wallThickness / 2);
    wallGeometries.push(backWallGeometry);

    // Left wall
    const leftWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, scale.z);
    leftWallGeometry.translate(pos.x - scale.x / 2 - wallThickness / 2, (pos.y + wallHeight / 2) - (baseHeight / 2), pos.z);
    wallGeometries.push(leftWallGeometry);

    // Right wall
    const rightWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, scale.z);
    rightWallGeometry.translate(pos.x + scale.x / 2 + wallThickness / 2, (pos.y + wallHeight / 2) - (baseHeight / 2), pos.z);
    wallGeometries.push(rightWallGeometry);

    // Merge base and wall geometries
    const mergedGeometry = mergeGeometries([baseGeometry, ...wallGeometries]);

    // Create a single mesh from the merged geometry
    const platformMesh = new THREE.Mesh(mergedGeometry, platformMaterial);
    platformMesh.visible = false;
    platformMesh.userData.name = 'platform';


    // Create the trimesh collider
    const vertices = [];
    const indices = [];

    mergedGeometry.attributes.position.array.forEach((v) => {
        vertices.push(v / physicsScaleRate);
    });

    for (let i = 0; i < mergedGeometry.index.count; i++) {
        indices.push(mergedGeometry.index.array[i]);
    }

    const collider = RAPIER.ColliderDesc.trimesh(vertices, indices);
    const rigidBody = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
        pos.x / physicsScaleRate,
        pos.y / physicsScaleRate,
        pos.z / physicsScaleRate
    ).setCcdEnabled(true);

    return { mesh: platformMesh, rigidBody, collider };
};