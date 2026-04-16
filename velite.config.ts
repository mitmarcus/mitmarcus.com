import rehypePrettyCode from 'rehype-pretty-code';
import { defineCollection, defineConfig, s } from 'velite';

const allPosts = defineCollection({
	name: 'Post',
	pattern: 'blog/**/*.mdx',
	schema: s
		.object({
			title: s.string(),
			slug: s.string(),
			description: s.string(),
			publishedAt: s.isodate(),
			language: s.string(),
			content: s.mdx(),
		})
		.transform((data) => ({
			...data,
			year: new Date(data.publishedAt).getFullYear(),
			permalink: `/blog/${data.slug}`,
		})),
});

const allProjects = defineCollection({
	name: 'Project',
	pattern: 'projects/**/*.mdx',
	schema: s
		.object({
			title: s.string(),
			slug: s.string(),
			description: s.string(),
			imageUrl: s.string(),
			demoUrl: s.string().optional(),
			repoUrl: s.string().optional(),
			// repoName should be the same as your Github repo name in order to fetch data successfully.
			repoName: s.string().optional(),
			language: s.string(),
			content: s.mdx(),
		})
		.transform((data) => ({
			...data,
			permalink: `/projects/${data.slug}`,
		})),
});

const allPages = defineCollection({
	name: 'Page',
	pattern: 'pages/**/*.mdx',
	schema: s
		.object({
			slug: s.string(),
			language: s.string(),
			content: s.mdx(),
		})
		.transform((data) => ({
			...data,
			permalink: `/${data.slug}`,
		})),
});

export default defineConfig({
	collections: { allPosts, allProjects, allPages },
	mdx: {
		rehypePlugins: [
			[
				rehypePrettyCode,
				{
					keepBackground: false,
					theme: 'github-dark',
				},
			],
		],
	},
});
