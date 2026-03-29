/**
 * FileName: setup-env.mjs
 * Description: Bootstraps frontend .env from .env.example and validates required variables.
 * Authors: Original Monarca team
 * Last Modification made:
 * 26/03/2026 [Diego de la Vega] Added portable setup and environment validation flow.
 */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const envPath = path.join(root, '.env');
const envExamplePath = path.join(root, '.env.example');
const isCheckMode = process.argv.includes('--check');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .reduce((acc, line) => {
      const eqIndex = line.indexOf('=');
      if (eqIndex === -1) return acc;
      const key = line.slice(0, eqIndex).trim();
      const value = line.slice(eqIndex + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
}

// Creates .env from .env.example when missing to simplify first-time setup.
function ensureEnvFile() {
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('Created .env from .env.example');
  }
}

// Validates required frontend environment variables before runtime commands.
function checkRequiredVariables() {
  const required = ['VITE_API_URL'];
  const envVars = parseEnvFile(envPath);
  const missing = required.filter((key) => !envVars[key]);

  if (missing.length > 0) {
    console.error(`Missing required variables in .env: ${missing.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  console.log('Environment variables validated');
}

if (!isCheckMode) {
  ensureEnvFile();
}

checkRequiredVariables();
