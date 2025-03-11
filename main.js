import { setupInteractionLayer } from './interaction_layer.js';
import './style.css';

setupInteractionLayer(document.querySelector('#interaction_layer_container'));

// Hide the loading screen once the interaction layer is set up
document.getElementById('loading_screen').style.display = 'none';
