/**
 * FileName: vite.config.ts
 * Description: Vite configuration for frontend build/dev behavior and optional local HTTPS.
 * Authors: Original Monarca team
 * Last Modification made:
 * 26/03/2026 [Diego de la Vega] Added ESM-safe path resolution for local cert detection.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Enable HTTPS only when local cert files are present.
    https: fs.existsSync(path.resolve(__dirname, 'certs/frontend-key.pem')) 
      ? {
          key: fs.readFileSync(path.resolve(__dirname, 'certs/frontend-key.pem')),
          cert: fs.readFileSync(path.resolve(__dirname, 'certs/frontend.pem')),
        }
      : undefined,
  }
});
