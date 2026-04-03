export type InstaCategory = 'posts' | 'stories';

export type InstaMediaType = 'image' | 'video';

export type InstaMediaItem = {
	id: string;
	path: string;
	category: InstaCategory;
	date: string; // YYYY-MM format derived from folder name
	type: InstaMediaType;
	extension: string;
};

export type InstaManifest = {
	generatedAt: string;
	totalCount: number;
	items: InstaMediaItem[];
};
