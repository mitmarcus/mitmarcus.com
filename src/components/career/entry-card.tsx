import Logo from '@/components/career/logo';
import useEntryText from '@/hooks/career/use-entry-text';
import { type PlacedEntry, position } from '@/utils/career/timeline';

type EntryCardProps = {
	entry: PlacedEntry;
	onOpen: () => void;
};

const EntryCard = ({ entry, onOpen }: EntryCardProps) => {
	const { text } = useEntryText();
	const { title, org } = text(entry);

	return (
		<button
			type='button'
			title={`${title} · ${org}`}
			aria-label={`${title} · ${org}`}
			onClick={onOpen}
			style={{ ...position(entry), backgroundColor: entry.color }}
			className='absolute bottom-(--x) left-(--left) flex h-[calc(var(--size)-3px)] w-(--width) cursor-pointer items-center justify-center rounded-xl border border-white/10 shadow-sm transition hover:brightness-125 active:scale-[0.97]'
		>
			{entry.accent ? (
				<span
					style={{ color: entry.accent }}
					className='text-sm font-bold'
				>
					{entry.initials}
				</span>
			) : (
				<Logo
					entry={entry}
					className='size-6'
				/>
			)}
		</button>
	);
};

export default EntryCard;
