import { defineConfig } from "cypress";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hasCerts = fs.existsSync(path.resolve(__dirname, 'certs/frontend-key.pem'));

export default defineConfig({
  e2e: {
    baseUrl: hasCerts ? "https://localhost:5173" : "http://localhost:5173", // Vite's default port
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    screenshotsFolder: 'coverage/cypress/screenshots',
  },
});
