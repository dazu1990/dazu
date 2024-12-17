import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import {setupInteractionLayer} from './interaction_layer.js'

// document.querySelector('#app').innerHTML = `
//   <div>
//     <div class="content_layer">
//       <a href="https://vite.dev" target="_blank">
//         <img src="${viteLogo}" class="logo" alt="Vite logo" />
//       </a>
//       <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//         <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
//       </a>
//       <h1>Hello Vite!</h1>
//       <div class="card">
//         <button id="counter" type="button"></button>
//       </div>
//       <p class="read-the-docs">
//         Click on the Vite logo to learn more
//       </p>
//     </div>
//     <div id="interaction_layer_container"></div>
//   </div>
// `

document.querySelector('#app').innerHTML = `
  <div>

    <div id="interaction_layer_container"></div>
  </div>
`

// setupCounter(document.querySelector('#counter'))


setupInteractionLayer(document.querySelector('#interaction_layer_container'))
