import { type NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';

import { siteConfig } from '@/config/site';

export const dynamic = 'force-dynamic';

export const GET = async (req: NextRequest) => {
	try {
		const repoName = req.nextUrl.searchParams.get('repoName');

		// Initialize Octokit with GitHub Auth Token
		const octokit = new Octokit({
			//auth: process.env.GITHUB_AUTH_TOKEN,
		});

		// Check if specific repoName is provided
		if (repoName) {
			// Fetch specific repo details
			const { data: repo } = await octokit.request(
				'GET /repos/{owner}/{repo}',
				{
					owner: siteConfig.githubUsername,
					repo: repoName,
				},
			);

			// Return repo stars and forks
			return NextResponse.json({
				stars: repo?.stargazers_count || 0,
				forksCount: repo?.forks_count || 0,
			});
		}

		// Fetch all repositories of the user
		const { data: repos } = await octokit.request(
			'GET /users/{username}/repos',
			{
				username: siteConfig.githubUsername,
			},
		);

		// Fetch followers of the user
		const { data: followers } = await octokit.request(
			'GET /users/{username}/followers',
			{
				username: siteConfig.githubUsername,
			},
		);

		// Calculate total stars from non-forked repositories
		const stars = repos
			.filter((repo: { fork: boolean }) => !repo.fork)
			.reduce(
				(acc: number, repo: { stargazers_count?: number }) =>
					acc + (repo.stargazers_count || 0),
				0,
			);

		// Return the total stars and follower count
		return NextResponse.json({
			followers: followers.length,
			stars,
		});
	} catch (error) {
		// Handle errors and return a meaningful message
		console.error('Error fetching data from GitHub:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch data from GitHub' },
			{ status: 500 },
		);
	}
};
