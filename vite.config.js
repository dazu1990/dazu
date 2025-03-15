import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {


  // Fallback to default paths if environment variables are not defined
  const sslKeyPath = path.resolve(__dirname, 'localhost.key');
  const sslCertPath = path.resolve(__dirname, 'localhost.crt');

  return {
    server: {
      https: {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath),
      },
      host: '0.0.0.0', // Ensure the server is accessible externally
    },
    plugins: [
      wasm(),
      topLevelAwait(),
    ],
    build: {
      target: 'esnext',
    },
    publicDir: 'public', // Ensure this is set to the correct directory for static files
  };
});