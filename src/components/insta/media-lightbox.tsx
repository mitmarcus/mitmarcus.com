'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
	const touchStartX = useRef<number | null>(null);
	const touchStartY = useRef<number | null>(null);

	const goPrev = useCallback(() => {
		if (currentIndex > 0) onNavigate(currentIndex - 1);
	}, [currentIndex, onNavigate]);

	const goNext = useCallback(() => {
		if (currentIndex < items.length - 1) onNavigate(currentIndex + 1);
	}, [currentIndex, items.length, onNavigate]);

	// Route all close actions through history.back() so the browser back button
	// closes the lightbox instead of leaving the page.
	const closedRef = useRef(false);
	const handleClose = useCallback(() => {
		if (!closedRef.current) {
			closedRef.current = true;
			history.back();
		}
	}, []);

	// Push a history entry when the lightbox opens; popstate fires on back → close.
	useEffect(() => {
		closedRef.current = false;
		history.pushState({ lightbox: true }, '');
		const handlePop = () => {
			closedRef.current = true;
			onClose();
		};
		window.addEventListener('popstate', handlePop);
		return () => {
			window.removeEventListener('popstate', handlePop);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') handleClose();
			if (e.key === 'ArrowLeft') goPrev();
			if (e.key === 'ArrowRight') goNext();
		};
		document.body.style.overflow = 'hidden';
		window.addEventListener('keydown', handleKey);
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', handleKey);
		};
	}, [handleClose, goPrev, goNext]);

	useEffect(() => {
		const update = () =>
			document.documentElement.style.setProperty(
				'--outer-height',
				`${window.outerHeight}px`,
			);
		update();
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('resize', update);
			document.documentElement.style.removeProperty('--outer-height');
		};
	}, []);

	if (!item) return null;

	const dateLabel =
		item.date !== 'unknown'
			? new Date(item.date + '-01').toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
				})
			: '';

	return createPortal(
		<>
			{/*
			 * iOS Safari viewport-color trick (discovered from apple.com nav).
			 * A fixed container with height < 50vh containing a 100vh child forces
			 * Safari to paint the overscroll / URL-bar region with the child's
			 * background color, making the lightbox feel truly full-screen.
			 *
			 * Absolutely insane that people need to do this for a billion dollar company.
			 */}
			<div
				aria-hidden
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					display: 'block',
					width: '100vw',
					height: '48px',
					zIndex: 99,
					pointerEvents: 'none',
				}}
			>
				<div
					style={{
						backgroundColor: '#000',
						height: 'var(--outer-height, 100dvh)',
					}}
				/>
			</div>

			{/*
			 * iOS 26 Safari fix: position: fixed clips to the "inner" viewport,
			 * so the backdrop won't extend behind the status bar or address bar.
			 * Use position: absolute instead, sized to the full page height, with
			 * a sticky inner div so the modal content stays in view.
			 */}
			<div
				className='absolute top-0 left-0 w-full z-[100] isolate'
				style={{ height: document.body.clientHeight }}
			>
				{/* Backdrop – absolute so it covers the full page */}
				<div
					className='absolute inset-0'
					style={{ backgroundColor: '#000' }}
				/>

				{/* Sticky content – pinned to the visual viewport */}
				<div
					className='sticky top-0 left-0 w-full h-dvh flex flex-col'
					style={{
						paddingTop: 'env(safe-area-inset-top, 0px)',
						paddingBottom: 'env(safe-area-inset-bottom, 0px)',
					}}
					onTouchStart={(e) => {
						touchStartX.current = e.touches[0].clientX;
						touchStartY.current = e.touches[0].clientY;
					}}
					onTouchEnd={(e) => {
						if (touchStartX.current === null || touchStartY.current === null)
							return;
						const dx = e.changedTouches[0].clientX - touchStartX.current;
						const dy = e.changedTouches[0].clientY - touchStartY.current;
						touchStartX.current = null;
						touchStartY.current = null;
						// Swipe down to close (vertical dominant gesture)
						if (dy > 80 && Math.abs(dy) > Math.abs(dx)) {
							handleClose();
							return;
						}
						if (Math.abs(dx) < 50) return;
						if (dx < 0) goNext();
						else goPrev();
					}}
				>
					{/* Top bar */}
					<div className='flex items-center gap-3 px-2 sm:px-4 py-2 sm:py-3 bg-black/60 backdrop-blur-sm shrink-0'>
						<span className='min-w-0 flex-1 truncate text-sm text-white/60 capitalize'>
							{item.category.replace('_', ' ')}
							{dateLabel && <> &middot; {dateLabel}</>}
						</span>
						<span className='shrink-0 text-sm text-white/40 tabular-nums'>
							{currentIndex + 1} / {items.length}
						</span>
						<button
							onClick={handleClose}
							className='shrink-0 rounded-full border border-white/10 bg-black/40 p-2.5 sm:p-3 text-white/70 backdrop-blur-sm hover:border-white/20 hover:bg-black/70 hover:text-white transition-colors'
							aria-label='Close'
						>
							<RiCloseLine className='h-6 w-6 sm:h-7 sm:w-7' />
						</button>
					</div>

					{/* Media area */}
					<div className='relative flex-1 flex items-center justify-center overflow-hidden'>
						{/* Backdrop click to close */}
						<div
							className='absolute inset-0'
							onClick={handleClose}
						/>

						{/* Prev button – desktop only (side) */}
						{currentIndex > 0 && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									goPrev();
								}}
								className='hidden sm:flex absolute left-4 z-10 rounded-full border border-white/10 bg-black/40 p-3 text-white/70 backdrop-blur-sm hover:border-white/20 hover:bg-black/70 hover:text-white transition-colors'
								aria-label='Previous'
							>
								<RiArrowLeftSLine className='h-7 w-7' />
							</button>
						)}

						{/* Next button – desktop only (side) */}
						{currentIndex < items.length - 1 && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									goNext();
								}}
								className='hidden sm:flex absolute right-4 z-10 rounded-full border border-white/10 bg-black/40 p-3 text-white/70 backdrop-blur-sm hover:border-white/20 hover:bg-black/70 hover:text-white transition-colors'
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

					{/* Bottom bar – mobile only */}
					<div className='flex sm:hidden items-center justify-between px-2 py-2 bg-black/60 backdrop-blur-sm shrink-0'>
						<button
							onClick={goPrev}
							disabled={currentIndex === 0}
							className='rounded-full border border-white/10 bg-black/40 p-2.5 text-white/70 backdrop-blur-sm hover:border-white/20 hover:bg-black/70 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none'
							aria-label='Previous'
						>
							<RiArrowLeftSLine className='h-6 w-6' />
						</button>
						<button
							onClick={goNext}
							disabled={currentIndex >= items.length - 1}
							className='rounded-full border border-white/10 bg-black/40 p-2.5 text-white/70 backdrop-blur-sm hover:border-white/20 hover:bg-black/70 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none'
							aria-label='Next'
						>
							<RiArrowRightSLine className='h-6 w-6' />
						</button>
					</div>
				</div>
			</div>
		</>,
		document.body,
	);
}
