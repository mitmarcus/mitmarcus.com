'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { RiPlayFill } from 'react-icons/ri';

import useIntersection from '@/hooks/use-intersection';
import type { InstaMediaItem } from '@/types/insta';

type MediaGridProps = {
	items: InstaMediaItem[];
	onItemClick: (index: number) => void;
};

function LazyMediaCell({
	item,
	onClick,
}: {
	item: InstaMediaItem;
	onClick: () => void;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const entry = useIntersection(ref, { rootMargin: '200px' });
	const [hasIntersected, setHasIntersected] = useState(false);

	if (entry?.isIntersecting && !hasIntersected) setHasIntersected(true);
	const isVisible = hasIntersected;

	return (
		<div
			ref={ref}
			className='relative aspect-square cursor-pointer overflow-hidden rounded-sm bg-card group'
			onClick={onClick}
		>
			{isVisible && (
				<>
					{item.type === 'image' ? (
						<Image
							src={item.path}
							alt=''
							fill
							sizes='(max-width: 500px) 50vw, (max-width: 768px) 33vw, 25vw'
							className='object-cover transition-transform duration-300 group-hover:scale-105'
							loading='lazy'
							unoptimized
						/>
					) : (
						<video
							src={item.path}
							className='h-full w-full object-cover'
							preload='metadata'
							muted
							playsInline
						/>
					)}
					{item.type === 'video' && (
						<div className='absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors'>
							<RiPlayFill className='h-8 w-8 text-white drop-shadow-lg' />
						</div>
					)}
					<div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors' />
				</>
			)}
		</div>
	);
}

export default function MediaGrid({ items, onItemClick }: MediaGridProps) {
	return (
		<div className='grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 gap-1'>
			{items.map((item, index) => (
				<LazyMediaCell
					key={item.id}
					item={item}
					onClick={() => onItemClick(index)}
				/>
			))}
		</div>
	);
}
