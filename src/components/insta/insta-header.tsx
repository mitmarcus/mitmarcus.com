'use client';

import Logo from '@/components/logo';
import useScrollVisibility from '@/hooks/use-scroll-visibility';
import { cn } from '@/utils/cn';

export default function InstaHeader() {
	const isVisible = useScrollVisibility();

	return (
		<header
			className={cn(
				'sticky top-6 z-10 flex justify-center duration-500 ease-in-out transition-transform',
				{ '-translate-y-20': !isVisible },
			)}
		>
			<div className='flex h-14 w-3/4 items-center justify-between gap-2 rounded-full border border-border bg-neutral-800/50 px-2 backdrop-blur-sm sm:w-fit'>
				<a
					href='https://www.mitmarcus.com'
					aria-label='Home'
					className='pl-3 pr-1 text-foreground hover:text-primary transition-colors'
				>
					<Logo className='size-5' />
				</a>
				<div className='flex items-center rounded-full border border-border bg-neutral-800 px-3 py-1.5 mr-1'>
					<span className='text-sm text-foreground/70'>Instagram Archive</span>
				</div>
			</div>
		</header>
	);
}
