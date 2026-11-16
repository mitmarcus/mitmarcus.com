import type { Entry } from '@/config/career';
import { cn } from '@/utils/cn';

type LogoProps = {
	entry: Entry;
	className?: string;
};

const Logo = ({ entry, className }: LogoProps) => (
	<span
		style={{ backgroundColor: entry.color }}
		className={cn(
			'flex size-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold text-white',
			className,
		)}
	>
		{entry.initials}
	</span>
);

export default Logo;
