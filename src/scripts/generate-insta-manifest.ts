import * as fs from 'fs';
import * as path from 'path';

type InstaCategory = 'posts' | 'stories' | 'archived_posts' | 'other';
type InstaMediaType = 'image' | 'video';

const THUMB_DIR_NAME = 'thumbs';

type InstaMediaItem = {
	id: string;
	path: string;
	thumbPath?: string;
	category: InstaCategory;
	date: string;
	type: InstaMediaType;
	extension: string;
};

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.avi', '.webm']);
const CATEGORIES: InstaCategory[] = ['posts', 'stories']
function getMediaType(ext: string): InstaMediaType | null {
	if (IMAGE_EXTENSIONS.has(ext)) return 'image';
	if (VIDEO_EXTENSIONS.has(ext)) return 'video';
	return null;
}

function parseDateFromFolder(folderName: string): string {
	// Folder names are YYYYMM format
	const match = folderName.match(/^(\d{4})(\d{2})$/);
	if (match) return `${match[1]}-${match[2]}`;
	return 'unknown';
}

function scanCategory(mediaDir: string, category: InstaCategory): InstaMediaItem[] {
	const categoryDir = path.join(mediaDir, category);
	if (!fs.existsSync(categoryDir)) return [];

	const items: InstaMediaItem[] = [];

	const entries = fs.readdirSync(categoryDir, { withFileTypes: true });
	for (const entry of entries) {
		if (entry.isDirectory()) {
			// Month directory (YYYYMM)
			const date = parseDateFromFolder(entry.name);
			const monthDir = path.join(categoryDir, entry.name);
			const files = fs.readdirSync(monthDir, { withFileTypes: true });

			for (const file of files) {
				if (!file.isFile()) continue;
				const ext = path.extname(file.name).toLowerCase();
				const mediaType = getMediaType(ext);
				if (!mediaType) continue; // skip extensionless/unknown files

				const id = path.basename(file.name, ext);
				const thumbFile = `${id}.webp`;
				const thumbOnDisk = path.join(mediaDir, '..', THUMB_DIR_NAME, category, entry.name, thumbFile);
				const thumbPath = fs.existsSync(thumbOnDisk)
					? `/insta/${THUMB_DIR_NAME}/${category}/${entry.name}/${thumbFile}`
					: undefined;
				items.push({
					id,
					path: `/insta/media/${category}/${entry.name}/${file.name}`,
					thumbPath,
					category,
					date,
					type: mediaType,
					extension: ext,
				});
			}
		} else if (entry.isFile()) {
			// Root-level file in category (e.g., other/)
			const ext = path.extname(entry.name).toLowerCase();
			const mediaType = getMediaType(ext);
			if (!mediaType) continue;

			const id = path.basename(entry.name, ext);
			items.push({
				id,
				path: `/insta/media/${category}/${entry.name}`,
				category,
				date: 'unknown',
				type: mediaType,
				extension: ext,
			});
		}
	}

	return items;
}

function generateManifest() {
	const publicDir = path.resolve(process.cwd(), 'public');
	const mediaDir = path.join(publicDir, 'insta', 'media');

	if (!fs.existsSync(mediaDir)) {
		console.error('Instagram media directory not found:', mediaDir);
		process.exit(1);
	}

	const allItems: InstaMediaItem[] = [];
	for (const category of CATEGORIES) {
		const items = scanCategory(mediaDir, category);
		allItems.push(...items);
		console.log(`  ${category}: ${items.length} files`);
	}

	// Sort by date descending, then by id
	allItems.sort((a, b) => {
		if (a.date === b.date) return a.id.localeCompare(b.id);
		if (a.date === 'unknown') return 1;
		if (b.date === 'unknown') return -1;
		return b.date.localeCompare(a.date);
	});

	const manifest = {
		generatedAt: new Date().toISOString(),
		totalCount: allItems.length,
		items: allItems,
	};

	const outputDir = path.resolve(process.cwd(), 'src', 'data');
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	const outputPath = path.join(outputDir, 'insta-manifest.json');
	fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));

	console.log(`\nGenerated Instagram manifest: ${allItems.length} items → ${outputPath}`);
}

generateManifest();
