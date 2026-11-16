'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';

import EntryCard from '@/components/career/entry-card';
import EntrySheet from '@/components/career/entry-sheet';
import type { Entry } from '@/config/career';
import useEntryText from '@/hooks/career/use-entry-text';
import {
	firstYear,
	focusYear,
	lastYear,
	layout,
	newestFirst,
	percent,
	position,
	span,
	years,
} from '@/utils/career/timeline';

const ease = 'cubic-bezier(0.32, 0.72, 0, 1)';

const stackedBehindSheet = (
	progress: number,
	dragging: boolean,
): CSSProperties => ({
	transform: `scale(${1 - 0.065 * progress}) translateY(${12 * progress}px)`,
	opacity: 1 - 0.3 * progress,
	borderRadius: `${16 + 8 * progress}px`,
	transition: dragging
		? 'none'
		: `transform 0.5s ${ease}, opacity 0.5s ${ease}, border-radius 0.5s ease`,
});

const CareerJourney = () => {
	const { t, text } = useEntryText();
	const [panel, setPanel] = useState<HTMLElement | null>(null);
	const [selected, setSelected] = useState(newestFirst[0]);
	const [isOpen, setIsOpen] = useState(false);
	const [dragProgress, setDragProgress] = useState<number | null>(null);
	const timeline = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = timeline.current;
		el?.parentElement?.scrollTo({
			top:
				el.offsetTop + (el.offsetHeight * (lastYear - focusYear)) / span - 24,
		});
	}, []);

	const open = (entry: Entry) => {
		setSelected(entry);
		setIsOpen(true);
		panel?.scrollIntoView({
			block: panel.offsetHeight > window.innerHeight ? 'end' : 'nearest',
			behavior: 'smooth',
		});
	};

	const step = (direction: number) => {
		const index = newestFirst.findIndex((entry) => entry.id === selected.id);
		const count = newestFirst.length;
		setSelected(newestFirst[(index + direction + count) % count]);
	};

	const progress = dragProgress ?? (isOpen ? 1 : 0);

	return (
		<section
			ref={setPanel}
			className='relative overflow-hidden bg-black'
		>
			<div
				style={stackedBehindSheet(progress, dragProgress !== null)}
				className='flex h-full origin-top flex-col bg-zinc-900 p-5 will-change-transform'
			>
				<h2 className='text-xs font-medium tracking-wider text-muted-foreground uppercase'>
					{t('title')}
				</h2>
				<div className='no-scrollbar relative mt-2 min-h-0 flex-1 overflow-y-auto mask-[linear-gradient(transparent,black_1.5rem,black_calc(100%-1.5rem),transparent)] [container-type:size]'>
					<div
						ref={timeline}
						style={{ '--years': span } as CSSProperties}
						className='relative my-6 flex h-[calc(var(--years)*(50cqh-1.5rem))] gap-1.5 pl-8'
					>
						{years.map((year) => (
							<div
								key={year}
								style={{ '--x': percent(year - firstYear) } as CSSProperties}
								className='absolute inset-x-0 bottom-(--x) flex translate-y-1/2 items-center gap-2'
							>
								<span className='w-6 text-[11px] text-muted-foreground tabular-nums'>
									’{String(year).slice(2)}
								</span>
								<div className='h-px flex-1 bg-border' />
							</div>
						))}
						<div className='relative w-7'>
							{layout('education').map((entry) => (
								<button
									key={entry.id}
									type='button'
									onClick={() => open(entry)}
									style={position(entry)}
									className='absolute bottom-(--x) left-(--left) flex h-[calc(var(--size)-3px)] w-(--width) cursor-pointer flex-col justify-center rounded-md border border-primary/30 bg-primary/10 bg-[repeating-linear-gradient(315deg,color-mix(in_oklab,var(--color-primary)_25%,transparent)_0_1px,transparent_0_50%)] bg-size-[10px_10px] text-xs font-medium whitespace-nowrap transition hover:bg-primary/20 active:scale-[0.97]'
								>
									<span className='rotate-180 [writing-mode:vertical-rl]'>
										{text(entry).org}
									</span>
								</button>
							))}
						</div>
						<div className='relative flex-1'>
							{layout('work').map((entry) => (
								<EntryCard
									key={entry.id}
									entry={entry}
									onOpen={() => open(entry)}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
			<EntrySheet
				container={panel}
				entry={selected}
				open={isOpen}
				onOpenChange={setIsOpen}
				onStep={step}
				onDragProgress={setDragProgress}
			/>
		</section>
	);
};

export default CareerJourney;
