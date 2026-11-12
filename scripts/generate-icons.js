import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
const standardSvg = fs.readFileSync(path.join(publicDir, 'icon.svg'), 'utf-8');

// Maskable icon SVG with full-bleed background and icon elements scaled inside the 80% center circle safe zone
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <!-- Full bleed background for any crop shape -->
  <rect width="512" height="512" fill="#0d9488"/>
  <circle cx="256" cy="256" r="230" fill="#0f766e" opacity="0.4"/>
  <!-- Scaled down to safe zone (0.75x centered) -->
  <g transform="translate(64, 64) scale(0.75)">
    <!-- Calendar Body -->
    <rect x="112" y="140" width="288" height="260" rx="36" fill="#ffffff"/>
    <!-- Calendar Rings / Pegs -->
    <rect x="160" y="100" width="36" height="64" rx="18" fill="#0f2a44"/>
    <rect x="316" y="100" width="36" height="64" rx="18" fill="#0f2a44"/>
    <!-- Top bar of calendar -->
    <path d="M112 196H400" stroke="#0d9488" stroke-width="12" stroke-linecap="round"/>
    <!-- Stethoscope in center -->
    <path d="M190 240V290C190 326 218 356 256 356C294 356 322 326 322 290V240" stroke="#0d9488" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Stethoscope earpieces -->
    <circle cx="190" cy="236" r="14" fill="#0f2a44"/>
    <circle cx="322" cy="236" r="14" fill="#0f2a44"/>
    <!-- Chest piece cord -->
    <path d="M256 356V380" stroke="#0d9488" stroke-width="20" stroke-linecap="round"/>
    <circle cx="256" cy="386" r="18" fill="#0f2a44"/>
    <!-- Plus badge in top right -->
    <circle cx="380" cy="130" r="44" fill="#0f2a44" stroke="#ffffff" stroke-width="8"/>
    <path d="M380 110V150M360 130H400" stroke="#5eead4" stroke-width="10" stroke-linecap="round"/>
  </g>
</svg>`;

async function generate() {
  console.log('Generating PWA icons...');
  
  // 192x192 any
  await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  // 512x512 any
  await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  // 512x512 maskable
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');

  // apple-touch-icon.png 180x180
  await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // favicon.png / 64x64
  await sharp(Buffer.from(standardSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Generated favicon.ico');

  console.log('All icons generated successfully!');
}

generate().catch(console.error);
