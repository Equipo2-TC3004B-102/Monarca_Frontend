import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from 'fs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // HTTPS solo si existen los certificados
    https: fs.existsSync(path.resolve(__dirname, 'certs/frontend-key.pem')) 
      ? {
          key: fs.readFileSync(path.resolve(__dirname, 'certs/frontend-key.pem')),
          cert: fs.readFileSync(path.resolve(__dirname, 'certs/frontend.pem')),
        }
      : undefined,
  }
});
