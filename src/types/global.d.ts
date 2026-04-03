declare module '*.css';

type Locale = 'en' | 'ro' | 'ru' | 'da' | undefined;

type Views = {
	slug: string;
	views: number;
}

type RepoInfo = {
	stars: number;
	forksCount: number;
}
