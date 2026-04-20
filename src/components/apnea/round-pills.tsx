'use client';

import { cn } from '@/utils/cn';

type RoundPillsProps = {
	totalRounds: number;
	currentRound: number;
	isHold: boolean;
};

export default function RoundPills({
	totalRounds,
	currentRound,
	isHold,
}: RoundPillsProps) {
	return (
		<div className='flex gap-1.5 mb-4'>
			{Array.from({ length: totalRounds }).map((_, i) => {
				const isCompleted = i < currentRound;
				const isCurrent = i === currentRound;
				return (
					<div
						key={i}
						className={cn(
							'h-1.5 rounded-full transition-all duration-500',
							isCompleted
								? 'w-1.5 bg-transparent border border-border'
								: isCurrent
									? cn('w-6', isHold ? 'bg-amber-400' : 'bg-blue-400')
									: 'w-1.5 bg-neutral-700',
						)}
					/>
				);
			})}
		</div>
	);
}
