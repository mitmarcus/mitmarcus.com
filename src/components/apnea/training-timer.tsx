'use client';

import {
	RiAddLine,
	RiCheckLine,
	RiPauseFill,
	RiPlayFill,
	RiSkipForwardFill,
	RiStopFill,
	RiTimeLine,
	RiVolumeMuteFill,
	RiVolumeUpFill,
} from 'react-icons/ri';

import type { TimerState } from '@/hooks/use-apnea-timer';
import type { ApneaTable, Phase } from '@/utils/apnea-tables';
import { formatTime, totalTableTime } from '@/utils/apnea-tables';
import { cn } from '@/utils/cn';

type TrainingTimerProps = {
	table: ApneaTable;
	timerState: TimerState;
	currentRound: number;
	totalRounds: number;
	currentPhase: Phase;
	timeRemaining: number;
	phaseDuration: number;
	progress: number;
	isMuted: boolean;
	onStart: () => void;
	onPause: () => void;
	onResume: () => void;
	onStop: () => void;
	onSkip: () => void;
	onAddTime: () => void;
	onToggleMute: () => void;
	onUpdatePB?: () => void;
};

export default function TrainingTimer({
	table,
	timerState,
	currentRound,
	totalRounds,
	currentPhase,
	timeRemaining,
	phaseDuration,
	progress,
	isMuted,
	onPause,
	onResume,
	onStop,
	onSkip,
	onAddTime,
	onToggleMute,
	onUpdatePB,
}: TrainingTimerProps) {
	// Completion screen
	if (timerState === 'finished') {
		return (
			<div className='text-center animate-fade-in max-w-sm mx-auto'>
				<div className='flex items-center justify-center size-16 rounded-full border border-border bg-neutral-800/50 mx-auto mb-6'>
					<RiCheckLine className='size-7 text-primary' />
				</div>
				<h2 className='text-xl font-bold text-foreground mb-2'>
					Session Complete
				</h2>
				<p className='text-sm text-foreground/40 mb-1'>{table.name}</p>
				<div className='flex items-center justify-center gap-1.5 text-sm text-foreground/30 mb-8'>
					<RiTimeLine className='size-3.5' />
					<span>{formatTime(totalTableTime(table))}</span>
					<span>·</span>
					<span>{totalRounds} rounds</span>
				</div>
				<div className='flex flex-col gap-3'>
					<button
						onClick={onStop}
						className='group relative w-full h-12 rounded-full border border-border bg-neutral-800 font-medium text-sm text-foreground hover:bg-neutral-800/0 transition-all'
					>
						<div className='absolute -bottom-px left-1/2 h-px w-14 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
						Done
					</button>
				</div>
			</div>
		);
	}

	const size = 260;
	const strokeWidth = 6;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const dashOffset = circumference * (1 - progress);

	const isHold = currentPhase === 'hold';
	const phaseColor = isHold ? '#fbbf24' : '#60a5fa';
	const phaseLabel = isHold ? 'HOLD' : 'BREATHE';
	const phaseTextColor = isHold ? 'text-amber-400' : 'text-blue-400';

	const primaryBg = isHold
		? 'bg-amber-400/10 border-amber-400/40 text-amber-300 hover:bg-amber-400/20 hover:border-amber-400/60'
		: 'bg-blue-400/10 border-blue-400/40 text-blue-300 hover:bg-blue-400/20 hover:border-blue-400/60';

	return (
		<div className='flex flex-col items-center animate-fade-in'>
			{/* Header */}
			<div className='flex items-center gap-3 mb-6'>
				<span className='text-sm text-foreground/40'>{table.name}</span>
				<span className='text-sm text-foreground/20'>·</span>
				<span className='text-sm text-foreground/40'>
					Round {currentRound + 1} / {totalRounds}
				</span>
			</div>

			{/* Progress ring */}
			<div
				className='relative mb-8'
				style={{ width: size, height: size }}
			>
				<svg
					width={size}
					height={size}
					className='transform -rotate-90'
				>
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						fill='none'
						stroke='currentColor'
						strokeWidth={strokeWidth}
						className='text-neutral-800/50'
					/>
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						fill='none'
						stroke={phaseColor}
						strokeWidth={strokeWidth}
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

			{/* Round pills */}
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

			{/* Controls */}
			<div className='flex flex-col items-center gap-4 mt-8'>
				<div className='flex items-center gap-4'>
					<button
						onClick={onStop}
						className='flex items-center justify-center size-10 rounded-full border border-border bg-transparent text-foreground/30 hover:text-red-400 hover:border-red-400/30 transition-all'
						title='Stop'
						id='apnea-stop'
					>
						<RiStopFill className='size-4' />
					</button>

					{timerState === 'running' ? (
						<button
							onClick={onPause}
							className={cn(
								'flex items-center justify-center rounded-full border transition-all',
								primaryBg,
							)}
							style={{ width: 72, height: 72 }}
							title='Pause'
							id='apnea-pause'
						>
							<RiPauseFill className='size-8' />
						</button>
					) : (
						<button
							onClick={onResume}
							className={cn(
								'flex items-center justify-center rounded-full border transition-all',
								primaryBg,
							)}
							style={{ width: 72, height: 72 }}
							title='Resume'
							id='apnea-resume'
						>
							<RiPlayFill className='size-8' />
						</button>
					)}

					<button
						onClick={onSkip}
						className='flex items-center justify-center size-10 rounded-full border border-border bg-transparent text-foreground/30 hover:text-foreground hover:bg-neutral-800/50 transition-all'
						title='Skip to next phase'
						id='apnea-skip'
					>
						<RiSkipForwardFill className='size-4' />
					</button>
				</div>

				<div className='flex items-center gap-2'>
					<button
						onClick={onAddTime}
						className='flex items-center gap-1.5 rounded-full border border-border bg-transparent px-3 py-2 text-xs text-foreground/40 hover:text-foreground/70 hover:bg-neutral-800/50 transition-all'
						title='Add 10 seconds'
						id='apnea-add-time'
					>
						<RiAddLine className='size-3.5' />
						10s
					</button>

					<button
						onClick={onToggleMute}
						className='flex items-center justify-center size-9 rounded-full border border-border bg-transparent text-foreground/40 hover:text-foreground/70 hover:bg-neutral-800/50 transition-all'
						title={isMuted ? 'Unmute' : 'Mute'}
						id='apnea-toggle-mute'
					>
						{isMuted ? (
							<RiVolumeMuteFill className='size-3.5' />
						) : (
							<RiVolumeUpFill className='size-3.5' />
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
