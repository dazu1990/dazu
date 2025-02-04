import * as THREE from 'three';
import { THEME } from '../../constants';

const themeColors = THEME.colors.three;

const generateMaterial = (index) => {

    let color = index % 2 ? 'pur' : 'grn';
    let colorTone = Math.random() < 0.5 ? 'light' : 'dark';
    let materialQuality = Math.random() < 0.5 ? 'phong' : 'lambert';

    let finalColor = colorTone === 'light' ? color : 'd' + color;

    if (materialQuality === 'phong') {
        return new THREE.MeshPhongMaterial({
            color: themeColors[finalColor],
            flatShading: true,
        });
    } else {
        return new THREE.MeshLambertMaterial({
            color: themeColors[finalColor],
            // reflectivity : Math.random() + (100 * Math.random()),
        });
    }

};


const obstacleOptions = [
  {
    type: 'cube',
    defaultGeometry: new THREE.BoxGeometry(10, 10, 10),
  },
  {
    type: 'sphere',
    defaultGeometry: new THREE.SphereGeometry(10, 32, 32),
  },
  {
    type: 'cone',
    defaultGeometry: new THREE.ConeGeometry(10, 30, 5, 1),
  },
  {
    type: 'cylinder',
    defaultGeometry: new THREE.CylinderGeometry(10, 10, 10, 32),
  },
  {
    type: 'torus',
    defaultGeometry: new THREE.TorusGeometry(10, 1, 16, 100),
  },
  {
    type: 'torusKnot',
    defaultGeometry: new THREE.TorusKnotGeometry(10, 1, 100, 16),
  },
  {
    type: 'tetrahedron',
    defaultGeometry: new THREE.TetrahedronGeometry(10),
  },
];

const generateObstacle = (index) => {
  const obstacle =
    obstacleOptions[Math.floor(Math.random() * obstacleOptions.length)];

  let geometry;

  let material = generateMaterial(index);

  const randMod = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  switch (obstacle.type) {
    case 'cube':
      geometry = new THREE.BoxGeometry(
        randMod(5, 10),
        randMod(5, 10),
        randMod(5, 10),
      );
      break;
    case 'sphere':
      geometry = new THREE.SphereGeometry(randMod(5, 10), 32, 32);
      break;
    case 'cone':
      geometry = new THREE.ConeGeometry(
        randMod(5, 10),
        randMod(5, 30),
        randMod(5, 15),
        1,
      );
      break;
    case 'cylinder':
      geometry = new THREE.CylinderGeometry(
        randMod(5, 10),
        randMod(5, 10),
        randMod(5, 10),
        32,
      );
      break;
    case 'torus':
      geometry = new THREE.TorusGeometry(
        randMod(3, 10),
        randMod(1, 5),
        16,
        100,
      );
      break;
    case 'torusKnot':
      geometry = new THREE.TorusKnotGeometry(
        randMod(3, 10),
        randMod(1, 5),
        100,
        16,
      );
      break;
    case 'tetrahedron':
      geometry = new THREE.TetrahedronGeometry(10);
      break;
    default:
      geometry = new THREE.BoxGeometry(10, 10, 10);
  }

  const meshOutput = new THREE.Mesh(geometry, material);
  const scaleModifer = randMod(1, 2);
  meshOutput.scale.set(scaleModifer, scaleModifer, scaleModifer);

  return meshOutput;
};

const placeObstacle = (obstacleMesh, obstacleArea, scene) => {
    obstacleMesh.position.x = Math.random() * obstacleArea - obstacleArea / 2;
    obstacleMesh.position.y = 0;
    obstacleMesh.position.z = Math.random() * obstacleArea - obstacleArea / 2;

    obstacleMesh.rotation.x = Math.random() * 2 * Math.PI;
    obstacleMesh.rotation.y = Math.random() * 2 * Math.PI;
    obstacleMesh.updateMatrix();
    obstacleMesh.matrixAutoUpdate = false;

    scene.add(obstacleMesh);
  };

export const createObstacles = (scene) => {
  const amountObstacles = 7500;
  const obstacleDensity = 4;
  const obstacleArea = amountObstacles / obstacleDensity;

  for (let i = 0; i < amountObstacles; i++) {
    const obstacleMesh = generateObstacle(i);
    placeObstacle(obstacleMesh, obstacleArea, scene);
  }
};
