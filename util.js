export const randNum = (min, max) => {
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('Both min and max should be numbers');
  }
  if (min > max) {
    throw new RangeError('min should not be greater than max');
  }
  return Math.floor(Math.random() * (max - min + 1) + min);
}