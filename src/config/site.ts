export type SiteConfig = typeof siteConfig;

const baseUrl = process.env.NODE_ENV === 'production'
	? 'https://www.mitmarcus.com'
	: 'http://localhost:3000';

const instaUrl = process.env.NODE_ENV === 'production'
	? 'https://insta.mitmarcus.com'
	: 'http://insta.localhost:3000';

export const siteConfig = {
	name: 'Marcus Mitelea',
	author: 'Marcus Mitelea',
	email: 'mitmarcus@proton.me',
	siteUrl: baseUrl,
	instaUrl: instaUrl,
	githubUsername: 'mitmarcus',
	links: {
		github: 'https://github.com/mitmarcus',
		linkedin: 'https://www.linkedin.com/in/mitmarcus',
	},
	openGraph: {
		type: 'website',
		title: 'Marcus Mitelea',
		siteName: 'Marcus Mitelea',
		url: baseUrl,
		images: [
			{
				url: '/opengraph-image.jpg',
				width: 1200,
				height: 630,
				alt: 'Marcus Mitelea',
			},
		],
	},
};
