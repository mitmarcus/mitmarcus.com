import Image from 'next/image';

import type { Entry } from '@/config/career';
import { cn } from '@/utils/cn';

type LogoProps = {
	entry: Entry;
	className?: string;
};

const Logo = ({ entry, className }: LogoProps) =>
	entry.logo ? (
		<Image
			src={entry.logo}
			alt=''
			width={40}
			height={40}
			className={cn('size-5 shrink-0 rounded-md object-cover', className)}
		/>
	) : (
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
