import { initLandscape } from './ThreeScenes/Landscape/init';


export const setupInteractionLayer = () => {
  console.log('Setting up interaction layer');

  switch (window.location.pathname) {
    case '/landscape':
      initLandscape();
    break;
    default:
      initLandscape();

      console.log('No scene found');
    break;
  }

  
  
};
