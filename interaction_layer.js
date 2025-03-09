import { initLandscape } from './ThreeScenes/Landscape/init';
import { initTilt } from './ThreeScenes/Tilt/init';


export const setupInteractionLayer = (interactionDiv) => {
  console.log('Setting up interaction layer', interactionDiv);

  switch (window.location.pathname) {
    case '/landscape':
      initLandscape(interactionDiv);
    break;
    default:
      initTilt(interactionDiv);
    break;
  }

  
  
};
