'use client';

import type { Phase } from '@/utils/apnea/apnea-tables';
import { formatTime } from '@/utils/apnea/apnea-tables';
import { cn } from '@/utils/cn';

type ProgressRingProps = {
	phase: Phase;
	timeRemaining: number;
	phaseDuration: number;
	progress: number;
};

const SIZE = 260;
const STROKE_WIDTH = 6;

export default function ProgressRing({
	phase,
	timeRemaining,
	phaseDuration,
	progress,
}: ProgressRingProps) {
	const radius = (SIZE - STROKE_WIDTH) / 2;
	const circumference = 2 * Math.PI * radius;
	const dashOffset = circumference * (1 - progress);

	const isHold = phase === 'hold';
	const phaseColor = isHold ? '#fbbf24' : '#60a5fa';
	const phaseLabel = isHold ? 'HOLD' : 'BREATHE';
	const phaseTextColor = isHold ? 'text-amber-400' : 'text-blue-400';

	return (
		<div
			className='relative mb-8'
			style={{ width: SIZE, height: SIZE }}
		>
			<svg
				width={SIZE}
				height={SIZE}
				className='transform -rotate-90'
			>
				<circle
					cx={SIZE / 2}
					cy={SIZE / 2}
					r={radius}
					fill='none'
					stroke='currentColor'
					strokeWidth={STROKE_WIDTH}
					className='text-neutral-800/50'
				/>
				<circle
					cx={SIZE / 2}
					cy={SIZE / 2}
					r={radius}
					fill='none'
					stroke={phaseColor}
					strokeWidth={STROKE_WIDTH}
					strokeLinecap='round'
					strokeDasharray={circumference}
					strokeDashoffset={dashOffset}
					className='transition-[stroke-dashoffset] duration-200 ease-linear'
					style={{ filter: `drop-shadow(0 0 8px ${phaseColor}40)` }}
				/>
			</svg>

			<div className='absolute inset-0 flex flex-col items-center justify-center'>
				<span
					className={cn(
						'text-xs font-medium uppercase tracking-widest mb-2',
						phaseTextColor,
					)}
				>
					{phaseLabel}
				</span>
				<span className='text-5xl font-bold tabular-nums text-foreground tracking-tight'>
					{formatTime(timeRemaining)}
				</span>
				<span className='text-sm text-foreground/30 mt-2'>
					of {formatTime(phaseDuration)}
				</span>
			</div>
		</div>
	);
}
