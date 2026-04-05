import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

import { LOGO_PATHS, LOGO_VIEWBOX } from '@/components/logo';
import type { InstaManifest } from '@/types/insta';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const IMG_SIZE = 290;
const GAP = 10;
const CORNER_RADIUS = 12;

// Logo + text branding block (left panel)
const LOGO_W = 100;
const LOGO_H = 80;
const BRAND_GAP = 16;

function buildBrandSvg(): string {
	const labelFontSize = 13;
	const labelHeight = labelFontSize;

	const totalHeight = labelHeight + BRAND_GAP + LOGO_H;
	const totalWidth = 200;

	let y = 0;
	const labelY = y + labelFontSize;
	y += labelHeight + BRAND_GAP;
	const logoY = y;

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300&amp;display=swap');
  </style>
  <text x="${totalWidth / 2}" y="${labelY}"
    font-family="Inter, -apple-system, sans-serif" font-weight="300" font-size="${labelFontSize}"
    fill="rgba(255,255,255,0.5)" text-anchor="middle"
    letter-spacing="3" text-transform="uppercase">PHOTOS BY</text>
  <svg x="${(totalWidth - LOGO_W) / 2}" y="${logoY}" width="${LOGO_W}" height="${LOGO_H}" viewBox="${LOGO_VIEWBOX}">
    <g fill="white" transform="translate(0,12000) scale(1,-1)">
      ${LOGO_PATHS.map((d) => `<path d="${d}"/>`).join('\n      ')}
    </g>
  </svg>
</svg>`;
}

function roundedRectMask(w: number, h: number, r: number): Buffer {
	return Buffer.from(
		`<svg width="${w}" height="${h}"><rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`,
	);
}

async function roundCorners(img: Buffer, size: number): Promise<Buffer> {
	const mask = roundedRectMask(size, size, CORNER_RADIUS);
	return sharp(img)
		.resize(size, size, { fit: 'cover' })
		.composite([
			{
				input: await sharp(mask).resize(size, size).png().toBuffer(),
				blend: 'dest-in',
			},
		])
		.png()
		.toBuffer();
}

async function main() {
	const raw = await readFile(
		join(process.cwd(), 'src/data/insta-manifest.json'),
		'utf-8',
	);
	const manifest: InstaManifest = JSON.parse(raw);
	const posts = manifest.items
		.filter((i) => i.category === 'posts')
		.slice(0, 4);

	const brandSvg = buildBrandSvg();

	const [thumbnails, brandPng] = await Promise.all([
		Promise.all(
			posts.map(async (post) => {
				const filePath = join(process.cwd(), 'public', post.thumbPath!);
				const buffer = await readFile(filePath);
				return roundCorners(buffer, IMG_SIZE);
			}),
		),
		sharp(Buffer.from(brandSvg)).png().toBuffer(),
	]);

	const gridWidth = IMG_SIZE * 2 + GAP;
	const gridHeight = IMG_SIZE * 2 + GAP;
	const offsetX = Math.round((OG_WIDTH - gridWidth) / 2) + 80;
	const offsetY = Math.round((OG_HEIGHT - gridHeight) / 2);

	// Get brand block dimensions to center it in the left band
	const brandMeta = await sharp(brandPng).metadata();
	const brandW = brandMeta.width!;
	const brandH = brandMeta.height!;
	const leftBand = offsetX;
	const brandLeft = Math.round((leftBand - brandW) / 2);
	const brandTop = Math.round((OG_HEIGHT - brandH) / 2);

	const composite = await sharp({
		create: {
			width: OG_WIDTH,
			height: OG_HEIGHT,
			channels: 4,
			background: { r: 6, g: 6, b: 9, alpha: 1 },
		},
	})
		.composite([
			{ input: thumbnails[0], left: offsetX, top: offsetY },
			{ input: thumbnails[1], left: offsetX + IMG_SIZE + GAP, top: offsetY },
			{ input: thumbnails[2], left: offsetX, top: offsetY + IMG_SIZE + GAP },
			{
				input: thumbnails[3],
				left: offsetX + IMG_SIZE + GAP,
				top: offsetY + IMG_SIZE + GAP,
			},
			{ input: brandPng, left: brandLeft, top: brandTop },
		])
		.png()
		.toBuffer();

	const outPath = join(process.cwd(), 'public/insta-og.png');
	await writeFile(outPath, composite);
	console.log(`Generated ${outPath}`);
}

main();
