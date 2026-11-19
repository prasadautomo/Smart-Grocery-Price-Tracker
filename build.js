import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname);
const distDir = path.resolve(projectRoot, 'dist');

// dist/ is generated output; clear it so removed assets cannot survive a build.
if (path.dirname(distDir) !== projectRoot || path.basename(distDir) !== 'dist') {
  throw new Error('Refusing to clear a build directory outside the project root.');
}
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

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

// Copy the app shell; the public folder below is the only source for static assets.
const rootFiles = [
  'index.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'sw.js'
];

for (const file of rootFiles) {
  const src = path.join(__dirname, file);
  const dest = path.join(distDir, file);
  copyFile(src, dest);
}

// Preserve public asset paths used by index.html and manifest.json.
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  copyDir(publicDir, path.join(distDir, 'public'));
}

console.log('✅ Build successful! All web assets copied to dist/ for Vercel deployment.');

