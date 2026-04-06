import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect x="0" y="0" width="8" height="630" fill="#2563eb"/>
  <text x="80" y="120" font-family="-apple-system, 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif" font-size="20" letter-spacing="6" fill="#a3a3a3" font-weight="600">SAPPORO CHESS CLUB</text>
  <text x="80" y="280" font-family="-apple-system, 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif" font-size="160" font-weight="900" fill="#171717" letter-spacing="-4">札幌</text>
  <text x="80" y="440" font-family="-apple-system, 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif" font-size="160" font-weight="900" fill="#171717" letter-spacing="-4">チェスクラブ</text>
  <text x="80" y="540" font-family="-apple-system, 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif" font-size="22" fill="#737373">北海道のチェス愛好家コミュニティ</text>
  <text x="1120" y="120" font-family="-apple-system, sans-serif" font-size="18" letter-spacing="3" fill="#2563eb" font-weight="600" text-anchor="end">EST. 1990s</text>
  <text x="1120" y="150" font-family="-apple-system, sans-serif" font-size="18" letter-spacing="3" fill="#2563eb" font-weight="600" text-anchor="end">HOKKAIDO</text>
</svg>`;

const outDir = `${__dirname}/../public/images`;
mkdirSync(outDir, { recursive: true });

await sharp(Buffer.from(ogSvg))
  .png()
  .toFile(`${outDir}/og.png`);

console.log("Generated public/images/og.png");

// Also generate a simple favicon PNG fallback (32x32) for older browsers
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="10" fill="#2563eb"/>
  <text x="32" y="48" font-family="-apple-system, 'Hiragino Kaku Gothic ProN', sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-2">札</text>
</svg>`;

await sharp(Buffer.from(faviconSvg))
  .resize(180, 180)
  .png()
  .toFile(`${__dirname}/../public/apple-touch-icon.png`);

await sharp(Buffer.from(faviconSvg))
  .resize(32, 32)
  .png()
  .toFile(`${__dirname}/../public/favicon-32x32.png`);

console.log("Generated favicon PNGs");
