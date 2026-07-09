// scripts/convert-to-webp.mjs
// Run with: node scripts/convert-to-webp.mjs
import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, '..', 'public');

const files = await readdir(publicDir);
const pngs = files.filter(f => extname(f).toLowerCase() === '.png' && f !== 'logo.png');

console.log(`Converting ${pngs.length} PNG(s) to WebP...`);

for (const file of pngs) {
  const inputPath = join(publicDir, file);
  const outputName = basename(file, '.png') + '.webp';
  const outputPath = join(publicDir, outputName);

  const before = (await stat(inputPath)).size;
  await sharp(inputPath)
    .webp({ quality: 82 })
    .toFile(outputPath);
  const after = (await stat(outputPath)).size;

  const saving = (((before - after) / before) * 100).toFixed(1);
  console.log(`  ${file} -> ${outputName}  (${(before/1024).toFixed(0)} KB -> ${(after/1024).toFixed(0)} KB, -${saving}%)`);
}

console.log('Done.');
