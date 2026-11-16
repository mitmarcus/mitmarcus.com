import Logo from '@/components/career/logo';
import useEntryText from '@/hooks/career/use-entry-text';
import { isLong, type PlacedEntry, position } from '@/utils/career/timeline';
import { cn } from '@/utils/cn';

const shape = {
	strip: 'flex-col items-center py-2',
	tall: 'flex-col items-start justify-between px-2 py-2',
	short: 'items-center',
};

type EntryCardProps = {
	entry: PlacedEntry;
	onOpen: () => void;
};

const EntryCard = ({ entry, onOpen }: EntryCardProps) => {
	const { text, dates } = useEntryText();
	const { title, org, short } = text(entry);
	const variant = entry.strip ? 'strip' : isLong(entry) ? 'tall' : 'short';

	return (
		<button
			type='button'
			title={`${title} · ${org}`}
			aria-label={`${title} · ${org}`}
			onClick={onOpen}
			style={position(entry)}
			className={cn(
				'@container absolute bottom-(--x) left-(--left) flex h-[calc(var(--size)-3px)] w-(--width) cursor-pointer gap-1.5 overflow-hidden rounded-xl border border-border bg-card px-1.5 text-left text-xs shadow-sm transition-colors hover:border-primary/40 hover:bg-accent',
				shape[variant],
			)}
		>
			<Logo entry={entry} />
			{variant === 'strip' ? (
				<span className='min-h-0 flex-1 rotate-180 truncate [writing-mode:vertical-rl]'>
					{short}
				</span>
			) : (
				<span
					className={cn(
						'w-full min-w-0',
						variant === 'tall'
							? 'flex flex-col gap-1'
							: 'hidden items-center gap-2 @[3.5rem]:flex',
					)}
				>
					<span className='truncate'>{short}</span>
					<span
						className={cn(
							'truncate font-mono text-[10px] text-muted-foreground uppercase',
							variant === 'short' && 'ml-auto hidden shrink-0 @[10rem]:inline',
						)}
					>
						{dates(entry)}
					</span>
				</span>
			)}
		</button>
	);
};

export default EntryCard;
