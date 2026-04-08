import { siteConfig } from '@/config/site';

const sitemap = async () => {
	const routes = ['', 'about', 'blog', 'projects']
		.map((route) => ({
			url: `${siteConfig.siteUrl}/${route}`,
			lastModified: new Date().toISOString().split('T')[0],
		}));

	const instaRoutes = [
		{
			url: siteConfig.instaUrl,
			lastModified: new Date().toISOString().split('T')[0],
		},
	];

	const apneaRoutes = [
		{
			url: siteConfig.apneaUrl,
			lastModified: new Date().toISOString().split('T')[0],
		},
	];

	return [
		...routes,
		...instaRoutes,
		...apneaRoutes,
	];
};

export default sitemap;
