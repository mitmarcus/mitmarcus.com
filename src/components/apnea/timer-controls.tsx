'use client';

import {
	RiAddLine,
	RiPauseFill,
	RiPlayFill,
	RiSkipForwardFill,
	RiStopFill,
	RiVolumeMuteFill,
	RiVolumeUpFill,
} from 'react-icons/ri';

import type { TimerState } from '@/hooks/apnea/use-apnea-timer';
import { cn } from '@/utils/cn';

type TimerControlsProps = {
	timerState: TimerState;
	isHold: boolean;
	isMuted: boolean;
	onPause: () => void;
	onResume: () => void;
	onStop: () => void;
	onSkip: () => void;
	onAddTime: () => void;
	onToggleMute: () => void;
};

export default function TimerControls({
	timerState,
	isHold,
	isMuted,
	onPause,
	onResume,
	onStop,
	onSkip,
	onAddTime,
	onToggleMute,
}: TimerControlsProps) {
	const primaryBg = isHold
		? 'bg-amber-400/10 border-amber-400/40 text-amber-300 hover:bg-amber-400/20 hover:border-amber-400/60'
		: 'bg-blue-400/10 border-blue-400/40 text-blue-300 hover:bg-blue-400/20 hover:border-blue-400/60';

	return (
		<div className='flex flex-col items-center gap-4'>
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
	);
}
