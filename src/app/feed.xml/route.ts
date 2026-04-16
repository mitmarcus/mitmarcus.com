import { NextResponse } from 'next/server';
import RSS from 'rss';
import { siteConfig } from '@/config/site';
import { allPosts } from '@/content';
import { defaultLocale } from '@/lib/navigation';

// Supports default locale language only
export const GET = () => {
	const feedOptions = {
		title: 'Marcus Mitelea',
		description: 'A developer website by Marcus Mitelea.',
		site_url: `${siteConfig.siteUrl}/`,
		feed_url: `${siteConfig.siteUrl}/feed.xml`,
		language: defaultLocale,
		image_url: `${siteConfig.siteUrl}/opengraph-image.jpg`,
	};

	const feed = new RSS(feedOptions);

	allPosts
		.filter((post) => post.language === defaultLocale)
		.forEach((post) => {
			feed.item({
				title: post.title,
				description: post.description,
				url: `${siteConfig.siteUrl}${post.permalink}`,
				date: post.publishedAt,
			});
		});

	return new NextResponse(feed.xml({ indent: true }), {
		headers: {
			'Content-Type': 'application/xml',
		},
	});
};
