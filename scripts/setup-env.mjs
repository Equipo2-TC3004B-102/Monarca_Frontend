/**
 * FileName: setup-env.mjs
 * Description: Bootstraps frontend .env from .env.example and validates required variables.
 * Authors: Original Monarca team
 * Last Modification made:
 * 03/06/2026 [Nicolas Quintana] Added function descriptions to ensureEnvFile and checkRequiredVariables.
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

/**
 * FunctionName: ensureEnvFile, Creates .env from .env.example when missing to simplify first-time setup.
 * Input: none
 * Output: Creates .env file if it doesn't exist and logs the action.
 */
function ensureEnvFile() {
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('Created .env from .env.example');
  }
}

/**
 * FunctionName: checkRequiredVariables, Validates required frontend environment variables before runtime commands.
 * Input: none
 * Output: Logs validation results and exits with error code if any required variables are missing.
 */
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
