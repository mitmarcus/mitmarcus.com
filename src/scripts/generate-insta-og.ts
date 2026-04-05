import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

import { LOGO_PATHS, LOGO_VIEWBOX } from '@/components/logo';
import type { InstaManifest } from '@/types/insta';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const IMG_SIZE = 265;
const GAP = 10;
const CORNER_RADIUS = 15;

const LOGO_W = 200;
const LOGO_H = 180;

function buildLogoSvg(): string {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${LOGO_W}" height="${LOGO_H}" viewBox="${LOGO_VIEWBOX}">
  <g fill="white" transform="translate(0,12000) scale(1,-1)">
    ${LOGO_PATHS.map((d) => `<path d="${d}"/>`).join('\n    ')}
  </g>
</svg>`;
}

function buildTextSvg(
	text: string,
	width: number,
	height: number,
	opacity: number,
	letterSpacing: number,
): string {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <text x="${width / 2}" y="${height * 0.78}"
    font-family="sans-serif" font-weight="300" font-size="${height * 0.6}"
    fill="rgba(255,255,255,${opacity})" text-anchor="middle"
    letter-spacing="${letterSpacing}">${text}</text>
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

	const TEXT_W = 265;
	const TEXT_H = 65;
	const SPACING = 20;

	const [thumbnails, logoPng, textPng] = await Promise.all([
		Promise.all(
			posts.map(async (post) => {
				const filePath = join(process.cwd(), 'public', post.thumbPath!);
				const buffer = await readFile(filePath);
				return roundCorners(buffer, IMG_SIZE);
			}),
		),
		sharp(Buffer.from(buildLogoSvg())).png().toBuffer(),
		sharp(Buffer.from(buildTextSvg('PHOTOS BY', TEXT_W, TEXT_H, 0.45, 6)))
			.png()
			.toBuffer(),
	]);

	const gridWidth = IMG_SIZE * 2 + GAP;
	const gridHeight = IMG_SIZE * 2 + GAP;
	// Grid on the right side with comfortable padding
	const gridPadRight = 40;
	const offsetX = OG_WIDTH - gridWidth - gridPadRight;
	const offsetY = Math.round((OG_HEIGHT - gridHeight) / 2);

	// Branding in the left zone 
	const leftBand = offsetX;
	const blockH = TEXT_H + SPACING + LOGO_H;
	const blockTop = Math.round((OG_HEIGHT - blockH) / 2);

	const textLeft = Math.round((leftBand - TEXT_W) / 2);
	const textTop = blockTop;

	const logoLeft = Math.round((leftBand - LOGO_W) / 2);
	const logoTop = blockTop + TEXT_H + SPACING;

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
			{ input: logoPng, left: logoLeft, top: logoTop },
			{ input: textPng, left: textLeft, top: textTop },
		])
		.png()
		.toBuffer();

	const outPath = join(process.cwd(), 'public/insta-og.png');
	await writeFile(outPath, composite);
	console.log(`Generated ${outPath}`);
}

main();
