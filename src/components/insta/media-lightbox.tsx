'use client';

import Image from 'next/image';
import { useCallback, useEffect } from 'react';
import {
	RiArrowLeftSLine,
	RiArrowRightSLine,
	RiCloseLine,
} from 'react-icons/ri';

import type { InstaMediaItem } from '@/types/insta';

type MediaLightboxProps = {
	items: InstaMediaItem[];
	currentIndex: number;
	onClose: () => void;
	onNavigate: (index: number) => void;
};

export default function MediaLightbox({
	items,
	currentIndex,
	onClose,
	onNavigate,
}: MediaLightboxProps) {
	const item = items[currentIndex];

	const goPrev = useCallback(() => {
		if (currentIndex > 0) onNavigate(currentIndex - 1);
	}, [currentIndex, onNavigate]);

	const goNext = useCallback(() => {
		if (currentIndex < items.length - 1) onNavigate(currentIndex + 1);
	}, [currentIndex, items.length, onNavigate]);

	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
			if (e.key === 'ArrowLeft') goPrev();
			if (e.key === 'ArrowRight') goNext();
		};
		document.body.style.overflow = 'hidden';
		window.addEventListener('keydown', handleKey);
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', handleKey);
		};
	}, [onClose, goPrev, goNext]);

	if (!item) return null;

	const dateLabel =
		item.date !== 'unknown'
			? new Date(item.date + '-01').toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
				})
			: '';

	return (
		<div className='fixed inset-0 z-[100] flex flex-col bg-black'>
			{/* Top bar */}
			<div className='flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm shrink-0'>
				<span className='text-sm text-white/60 capitalize'>
					{item.category.replace('_', ' ')}
					{dateLabel && <> &middot; {dateLabel}</>}
				</span>
				<span className='text-sm text-white/40'>
					{currentIndex + 1} / {items.length}
				</span>
				<button
					onClick={onClose}
					className='rounded-full p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors'
					aria-label='Close'
				>
					<RiCloseLine className='h-6 w-6' />
				</button>
			</div>

			{/* Media area */}
			<div className='relative flex-1 flex items-center justify-center overflow-hidden'>
				{/* Backdrop click to close */}
				<div
					className='absolute inset-0'
					onClick={onClose}
				/>

				{/* Prev button */}
				{currentIndex > 0 && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							goPrev();
						}}
						className='absolute left-4 z-10 rounded-full bg-black/50 p-3 text-white hover:bg-black/80 transition-colors'
						aria-label='Previous'
					>
						<RiArrowLeftSLine className='h-7 w-7' />
					</button>
				)}

				{/* Next button */}
				{currentIndex < items.length - 1 && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							goNext();
						}}
						className='absolute right-4 z-10 rounded-full bg-black/50 p-3 text-white hover:bg-black/80 transition-colors'
						aria-label='Next'
					>
						<RiArrowRightSLine className='h-7 w-7' />
					</button>
				)}

				{item.type === 'image' ? (
					<div
						className='relative w-full h-full'
						onClick={(e) => e.stopPropagation()}
					>
						<Image
							src={item.path}
							alt=''
							fill
							sizes='100vw'
							className='object-contain'
							priority
						/>
					</div>
				) : (
					<video
						key={item.path}
						src={item.path}
						controls
						autoPlay
						playsInline
						className='max-h-full max-w-full object-contain'
						onClick={(e) => e.stopPropagation()}
					/>
				)}
			</div>
		</div>
	);
}
