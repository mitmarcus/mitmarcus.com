'use client';

import { useMemo, useState } from 'react';

import MediaGrid from '@/components/insta/media-grid';
import MediaLightbox from '@/components/insta/media-lightbox';
import type { InstaMediaItem } from '@/types/insta';
import { cn } from '@/utils/cn';

type Tab = 'posts' | 'stories';

type InstaGalleryProps = {
	items: InstaMediaItem[];
};

function groupByYear(items: InstaMediaItem[]): [string, InstaMediaItem[]][] {
	const map = new Map<string, InstaMediaItem[]>();
	for (const item of items) {
		const year = item.date.startsWith('unknown')
			? 'Unknown'
			: item.date.slice(0, 4);
		if (!map.has(year)) map.set(year, []);
		map.get(year)!.push(item);
	}
	// Sort years descending
	return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

export default function InstaGallery({ items }: InstaGalleryProps) {
	const [tab, setTab] = useState<Tab>('posts');
	const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

	const posts = useMemo(
		() => items.filter((i) => i.category === 'posts'),
		[items],
	);
	const stories = useMemo(
		() => items.filter((i) => i.category === 'stories'),
		[items],
	);
	const storiesByYear = useMemo(() => groupByYear(stories), [stories]);

	// Flat list for lightbox navigation
	const activeItems = tab === 'posts' ? posts : stories;

	return (
		<>
			{/* Tabs */}
			<div className='mb-8 flex sm:inline-flex rounded-full border border-border bg-neutral-800/50 p-1'>
				{(['posts', 'stories'] as Tab[]).map((t) => (
					<button
						key={t}
						onClick={() => {
							setTab(t);
							setLightboxIndex(null);
						}}
						className={cn(
							'relative flex-1 sm:flex-initial rounded-full px-5 py-1.5 text-sm font-medium capitalize transition-all',
							tab === t
								? 'bg-neutral-800 text-foreground border border-border'
								: 'text-foreground/50 hover:text-foreground',
						)}
					>
						<span
							className={cn(
								'absolute -bottom-px left-1/2 h-px w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary to-transparent transition-opacity',
								tab === t ? 'opacity-100' : 'opacity-0',
							)}
						/>
						{t}
						<span className='ml-1.5 text-xs opacity-50'>
							{t === 'posts' ? posts.length : stories.length}
						</span>
					</button>
				))}
			</div>

			{/* Posts: flat grid */}
			{tab === 'posts' && (
				<MediaGrid
					items={posts}
					onItemClick={(index) => setLightboxIndex(index)}
				/>
			)}

			{/* Stories: grouped by year */}
			{tab === 'stories' && (
				<div className='space-y-10'>
					{storiesByYear.map(([year, yearItems]) => {
						// Offset into the flat stories array for correct lightbox index
						const offset = stories.indexOf(yearItems[0]);
						return (
							<div key={year}>
								<h2 className='mb-3 text-lg font-bold tracking-tight text-muted-foreground'>
									{year}
								</h2>
								<MediaGrid
									items={yearItems}
									onItemClick={(i) => setLightboxIndex(offset + i)}
								/>
							</div>
						);
					})}
				</div>
			)}

			{lightboxIndex !== null && (
				<MediaLightbox
					items={activeItems}
					currentIndex={lightboxIndex}
					onClose={() => setLightboxIndex(null)}
					onNavigate={(index) => setLightboxIndex(index)}
				/>
			)}
		</>
	);
}
