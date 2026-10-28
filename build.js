import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Helper to copy file
function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    const parentDir = path.dirname(dest);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

// Helper to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Copy essential root files to dist
const rootFiles = [
  'index.html',
  'styles.css',
  'app.js',
  'google-auth.html',
  'manifest.json',
  'sw.js',
  'favicon.svg',
  'pwa-icon.svg',
  'icons.svg',
  'auth-helper-server.js',
  'auth-helper-server.cjs'
];

for (const file of rootFiles) {
  const src = path.join(__dirname, file);
  const dest = path.join(distDir, file);
  copyFile(src, dest);
}

// 2. Copy public directory contents to dist
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  const publicFiles = fs.readdirSync(publicDir);
  for (const f of publicFiles) {
    const src = path.join(publicDir, f);
    const dest = path.join(distDir, f);
    if (fs.statSync(src).isDirectory()) {
      copyDir(src, dest);
    } else {
      copyFile(src, dest);
    }
  }
}

// 3. Copy assets directory if any
const assetsDir = path.join(__dirname, 'assets');
if (fs.existsSync(assetsDir)) {
  copyDir(assetsDir, path.join(distDir, 'assets'));
}

console.log('✅ Build successful! All web assets copied to dist/ for Vercel deployment.');

