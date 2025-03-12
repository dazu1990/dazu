import { setupInteractionLayer } from './interaction_layer.js';
import './style.css';

setupInteractionLayer(document.querySelector('#interaction_layer_container'));

document.querySelector('#loading_screen').style.display = 'none';