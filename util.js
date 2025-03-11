import RAPIER from '@dimforge/rapier3d';

export const joinBodies = (body1, body2, physicsWorld) => {
  const jointData = RAPIER.JointData.fixed(
    { x: 0.0, y: 0.0, z: 0.0 },
    { w: 1.0, x: 0.0, y: 0.0, z: 0.0 },
    { x: 0.0, y: -2.0, z: 0.0 },
    { w: 1.0, x: 0.0, y: 0.0, z: 0.0 },
  );
  physicsWorld.createImpulseJoint(jointData, body1, body2, true);
};

export const debounce = (func, wait, timeout) => {
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

export const randNum = (min, max) => {
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('Both min and max should be numbers');
  }
  if (min > max) {
    throw new RangeError('min should not be greater than max');
  }
  return Math.floor(Math.random() * (max - min + 1) + min);
};
