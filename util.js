import RAPIER from '@dimforge/rapier3d-compat'

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

export const initPhysics = async () => {
  await RAPIER.init();
  return RAPIER;
};

export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export const isIos = () => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}


/**
 * Screen Orientation Lock functionality
 * 
 * This module provides functions to lock and unlock the screen orientation
 * on mobile devices. It uses the Screen Orientation API when available and
 * provides a fallback message for iOS devices which don't support this API.
 */

/**
 * Lock the screen orientation to the current orientation
 * (portrait or landscape)
 */
export const lockScreenOrientation = async () => {
  try {
    
    if (!isMobile) return; // Only apply on mobile devices
    
    // Try to lock the screen orientation if the API is available
    if (screen.orientation && screen.orientation.lock) {
      // Get current orientation (portrait or landscape)
      const currentOrientation = window.innerWidth > window.innerHeight 
        ? 'landscape' 
        : 'portrait';
        
      // Lock to the current orientation
      await screen.orientation.lock(currentOrientation);
      console.log(`Screen orientation locked to ${currentOrientation}`);
    } 
    // iOS Safari doesn't support screen.orientation API, so provide a message
    else if (
      navigator.userAgent.match(/iPhone|iPad|iPod/i) && 
      !window.MSStream
    ) {
      console.log('Orientation lock not supported on iOS. Please use orientation lock in the Control Center.');
    }
  } catch (error) {
    console.error('Failed to lock screen orientation:', error);
  }
};

/**
 * Unlock the screen orientation, allowing it to change as the device is rotated
 */
export const unlockScreenOrientation = () => {
  if (screen.orientation && screen.orientation.unlock) {
    screen.orientation.unlock();
    console.log('Screen orientation unlocked');
  }
};