import * as THREE from 'three';

export const updateRotateGroup = (mouse, rotateGroup, platformBody) => {
    const maxRotationSpeed = 0.75; // Adjust this value as needed

    // Calculate deltas with clamping
    const deltaX = Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, mouse.x - mouse.oldX));
    const deltaY = Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, mouse.y - mouse.oldY));

    // Create quaternions for the rotations around the x and y axes
    const quaternionX = new THREE.Quaternion();
    const quaternionZ = new THREE.Quaternion();
    

    // Set the quaternions based on the mouse delta values
    quaternionX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * 0.35); // Rotation around x-axis
    quaternionZ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), deltaX * 0.35); // Rotation around z-axis

    // Multiply the current quaternion by the new quaternions
    rotateGroup.quaternion.multiplyQuaternions(
      quaternionX,
      rotateGroup.quaternion,
    );
    rotateGroup.quaternion.multiplyQuaternions(
      quaternionZ,
      rotateGroup.quaternion,
    );

    // Update the platform body's rotation to match the rotateGroup's quaternion
    const quaternion = rotateGroup.quaternion;
    platformBody.setRotation({
      w: quaternion.w,
      x: quaternion.x,
      y: quaternion.y,
      z: quaternion.z,
    });

    // Update the old mouse position
    mouse.oldX = mouse.x;
    mouse.oldY = mouse.y;
  };