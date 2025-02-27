import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import tailwindcss from '@tailwindcss/vite'


export default ({
  plugins: [
    wasm(),
    topLevelAwait(),
    tailwindcss()
  ]
});