#!/usr/bin/env node

// Loads the provided env file and forwards the command to the Next.js CLI.
const { readFileSync } = require('fs');
const { resolve } = require('path');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node scripts/with-env.js <env-file> <next-command> [...args]');
  process.exit(1);
}

const [envFile, ...nextArgs] = args;
const envPath = resolve(process.cwd(), envFile);

let fileContent;
try {
  fileContent = readFileSync(envPath, 'utf8');
} catch (error) {
  console.error(`Unable to read ${envFile}: ${error.message}`);
  process.exit(1);
}

fileContent.split(/\r?\n/).forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;

  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) return;

  const key = trimmed.slice(0, eqIndex).trim();
  const value = trimmed.slice(eqIndex + 1).trim();
  if (!key) return;

  if (process.env[key] === undefined) {
    process.env[key] = value;
  }
});

const nextBin = require.resolve('next/dist/bin/next');
const result = spawnSync(process.execPath, [nextBin, ...nextArgs], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
