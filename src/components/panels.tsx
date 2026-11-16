'use client';

import { useEffect, useRef, useState } from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';

type PanelsProps = {
	title: React.ReactNode;
	children: React.ReactNode;
	previousLabel: string;
	nextLabel: string;
};

const scrollPanels = (el: HTMLElement | null, direction: number) =>
	el?.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' });

const Panels = ({ title, children, previousLabel, nextLabel }: PanelsProps) => {
	const ref = useRef<HTMLDivElement>(null);
	const [atStart, setAtStart] = useState(true);
	const [atEnd, setAtEnd] = useState(false);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'ArrowLeft') scrollPanels(ref.current, -1);
			if (event.key === 'ArrowRight') scrollPanels(ref.current, 1);
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, []);

	const onScroll = () => {
		const el = ref.current;
		if (!el) return;
		setAtStart(el.scrollLeft < 8);
		setAtEnd(el.scrollLeft + el.clientWidth > el.scrollWidth - 8);
	};

	const button =
		'flex h-9 w-12 items-center justify-center rounded-lg border border-border bg-card text-lg transition-colors hover:bg-accent disabled:opacity-40';

	return (
		<>
			<div className='flex items-center justify-between'>
				{title}
				<div className='flex gap-2 md:hidden'>
					<button
						type='button'
						aria-label={previousLabel}
						disabled={atStart}
						onClick={() => scrollPanels(ref.current, -1)}
						className={button}
					>
						<RiArrowLeftSLine />
					</button>
					<button
						type='button'
						aria-label={nextLabel}
						disabled={atEnd}
						onClick={() => scrollPanels(ref.current, 1)}
						className={button}
					>
						<RiArrowRightSLine />
					</button>
				</div>
			</div>
			<div
				ref={ref}
				onScroll={onScroll}
				className='no-scrollbar -mx-6 mt-5 flex animate-fade-in snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 *:w-[calc(100vw-4.5rem)] *:shrink-0 *:snap-start *:rounded-2xl *:border *:border-border md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:*:w-auto animation-delay-1'
			>
				{children}
			</div>
		</>
	);
};

export default Panels;
