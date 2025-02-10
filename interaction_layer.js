import { initLandscape } from './ThreeScenes/Landscape/init';
import { initTilt } from './ThreeScenes/Tilt/init';


export const setupInteractionLayer = () => {
  console.log('Setting up interaction layer');

  switch (window.location.pathname) {
    case '/landscape':
      initLandscape();
    break;
    default:
      initTilt();

      console.log('No scene found');
    break;
  }

  
  
};
