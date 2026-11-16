import { useEffect } from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import { Drawer } from 'vaul';

import Logo from '@/components/career/logo';
import Link from '@/components/ui/link';
import type { Entry } from '@/config/career';
import useEntryText from '@/hooks/career/use-entry-text';
import { cn } from '@/utils/cn';

const sectionHeading =
	'mt-8 mb-3 flex items-center gap-3 font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase after:flex-1 after:border-t after:border-dotted after:border-border';

const pillButton =
	'flex h-8 items-center justify-center rounded-full border border-border bg-card transition hover:bg-accent active:scale-[0.97]';

const alwaysScrollable =
	'after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-[calc(100%+1px)]';

const useKeepPageInteractive = (open: boolean) =>
	useEffect(() => {
		if (!open) return;
		requestAnimationFrame(() => {
			document.body.style.pointerEvents = 'auto';
		});
	}, [open]);

type EntrySheetProps = {
	container: HTMLElement | null;
	entry: Entry;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onStep: (direction: number) => void;
	onDragProgress: (progress: number | null) => void;
};

const EntrySheet = ({
	container,
	entry,
	open,
	onOpenChange,
	onStep,
	onDragProgress,
}: EntrySheetProps) => {
	const { t, text, dates } = useEntryText();
	const { title, org, meta, points, skills } = text(entry);
	useKeepPageInteractive(open);

	return (
		<Drawer.Root
			open={open}
			onOpenChange={onOpenChange}
			container={container}
			modal={false}
			disablePreventScroll
			noBodyStyles
			closeThreshold={0.25}
			onDrag={(_, dragged) => onDragProgress(1 - dragged)}
			onRelease={() => onDragProgress(null)}
		>
			<Drawer.Portal>
				<Drawer.Content
					aria-describedby={undefined}
					className={cn(
						'absolute inset-x-0 bottom-0 z-20 flex h-[96%] max-h-[calc(100dvh-7rem)] flex-col overflow-hidden rounded-t-2xl border border-b-0 border-border bg-card shadow-2xl outline-none',
						alwaysScrollable,
					)}
				>
					<div className='mx-auto box-content h-1 w-10 shrink-0 cursor-grab rounded-full bg-muted-foreground/40 bg-clip-content p-3 active:cursor-grabbing' />
					<div
						key={entry.id}
						className='no-scrollbar flex-1 overflow-y-auto px-5 pt-3 pb-24'
					>
						<Logo entry={entry} className='size-10 rounded-lg text-sm' />
						<Drawer.Title className='mt-4 text-xl font-bold tracking-tight'>
							{title} -{' '}
							{entry.url ? (
								<Link
									className='underline decoration-primary underline-offset-4'
									href={entry.url}
								>
									{org}
								</Link>
							) : (
								org
							)}
						</Drawer.Title>
						<p className='mt-2 font-mono text-xs text-muted-foreground uppercase'>
							{dates(entry, true)}
						</p>
						{meta && <p className='mt-4 text-sm text-foreground/80'>{meta}</p>}
						{points && (
							<>
								<h4 className={sectionHeading}>{t('workedOn')}</h4>
								<ul className='list-disc space-y-2 pl-5 text-sm text-foreground/80'>
									{points.map((point) => (
										<li key={point}>{point}</li>
									))}
								</ul>
							</>
						)}
						{skills && (
							<>
								<h4 className={sectionHeading}>{t('stack')}</h4>
								<p className='text-sm text-foreground/80'>{skills}</p>
							</>
						)}
					</div>
					<div
						data-vaul-no-drag
						className='absolute inset-x-0 bottom-5 flex justify-center'
					>
						<div className='flex gap-1 rounded-full border border-border bg-background p-1 shadow-lg shadow-black/50'>
							<button
								type='button'
								aria-label={t('previous')}
								onClick={() => onStep(-1)}
								className={cn(pillButton, 'w-8')}
							>
								<RiArrowLeftSLine />
							</button>
							<button
								type='button'
								onClick={() => onOpenChange(false)}
								className={cn(
									pillButton,
									'px-6 font-mono text-xs tracking-wide uppercase',
								)}
							>
								{t('close')}
							</button>
							<button
								type='button'
								aria-label={t('next')}
								onClick={() => onStep(1)}
								className={cn(pillButton, 'w-8')}
							>
								<RiArrowRightSLine />
							</button>
						</div>
					</div>
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	);
};

export default EntrySheet;
