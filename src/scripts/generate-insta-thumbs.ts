import { execFile } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.avi', '.webm']);
const CATEGORIES = ['posts', 'stories'] as const;
const THUMB_SIZE = 270;
const THUMB_QUALITY = 80;
const THUMB_DIR_NAME = 'thumbs';

async function generateImageThumb(src: string, dest: string) {
	await sharp(src)
		.resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover' })
		.webp({ quality: THUMB_QUALITY })
		.toFile(dest);
}

async function generateVideoThumb(src: string, dest: string) {
	const tmpPng = dest.replace(/\.webp$/, '.tmp.png');
	try {
		await execFileAsync('ffmpeg', [
			'-i',
			src,
			'-ss',
			'0.5',
			'-frames:v',
			'1',
			'-vf',
			`scale=${THUMB_SIZE}:${THUMB_SIZE}:force_original_aspect_ratio=increase,crop=${THUMB_SIZE}:${THUMB_SIZE}`,
			'-y',
			'-loglevel',
			'error',
			tmpPng,
		]);

		await sharp(tmpPng).webp({ quality: THUMB_QUALITY }).toFile(dest);
	} finally {
		if (fs.existsSync(tmpPng)) fs.unlinkSync(tmpPng);
	}
}

async function generateThumbnails() {
	const publicDir = path.resolve(process.cwd(), 'public');
	const mediaDir = path.join(publicDir, 'insta', 'media');
	const thumbBaseDir = path.join(publicDir, 'insta', THUMB_DIR_NAME);

	if (!fs.existsSync(mediaDir)) {
		console.error('Instagram media directory not found:', mediaDir);
		process.exit(1);
	}

	let generated = 0;
	let skipped = 0;

	for (const category of CATEGORIES) {
		const categoryDir = path.join(mediaDir, category);
		if (!fs.existsSync(categoryDir)) continue;

		const entries = fs.readdirSync(categoryDir, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isDirectory()) continue;

			const monthDir = path.join(categoryDir, entry.name);
			const thumbDir = path.join(thumbBaseDir, category, entry.name);

			const files = fs.readdirSync(monthDir, { withFileTypes: true });
			for (const file of files) {
				if (!file.isFile()) continue;
				const ext = path.extname(file.name).toLowerCase();
				const isImage = IMAGE_EXTENSIONS.has(ext);
				const isVideo = VIDEO_EXTENSIONS.has(ext);
				if (!isImage && !isVideo) continue;

				const baseName = path.basename(file.name, ext);
				const thumbPath = path.join(thumbDir, `${baseName}.webp`);

				if (fs.existsSync(thumbPath)) {
					skipped++;
					continue;
				}

				fs.mkdirSync(thumbDir, { recursive: true });

				const srcPath = path.join(monthDir, file.name);
				try {
					if (isImage) {
						await generateImageThumb(srcPath, thumbPath);
					} else {
						await generateVideoThumb(srcPath, thumbPath);
					}
					generated++;
				} catch (err) {
					console.warn(`  Failed: ${file.name}`, (err as Error).message);
				}
			}
		}
	}

	console.log(`Thumbnails: ${generated} generated, ${skipped} already existed`);
}

generateThumbnails().catch((err) => {
	console.error('Failed to generate thumbnails:', err);
	process.exit(1);
});
