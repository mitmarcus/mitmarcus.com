'use client';

import CompletionScreen from '@/components/apnea/completion-screen';
import ProgressRing from '@/components/apnea/progress-ring';
import RoundPills from '@/components/apnea/round-pills';
import TimerControls from '@/components/apnea/timer-controls';
import type { TimerState } from '@/hooks/apnea/use-apnea-timer';
import type { ApneaTable, Phase } from '@/utils/apnea/apnea-tables';

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
}: TrainingTimerProps) {
	if (timerState === 'finished') {
		return (
			<CompletionScreen
				table={table}
				totalRounds={totalRounds}
				onDone={onStop}
			/>
		);
	}

	const isHold = currentPhase === 'hold';

	return (
		<div className='flex flex-col items-center animate-fade-in'>
			<div className='flex items-center gap-3 mb-6'>
				<span className='text-sm text-foreground/40'>{table.name}</span>
				<span className='text-sm text-foreground/20'>·</span>
				<span className='text-sm text-foreground/40'>
					Round {currentRound + 1} / {totalRounds}
				</span>
			</div>

			<ProgressRing
				phase={currentPhase}
				timeRemaining={timeRemaining}
				phaseDuration={phaseDuration}
				progress={progress}
			/>

			<RoundPills
				totalRounds={totalRounds}
				currentRound={currentRound}
				isHold={isHold}
			/>

			<TimerControls
				timerState={timerState}
				isHold={isHold}
				isMuted={isMuted}
				onPause={onPause}
				onResume={onResume}
				onStop={onStop}
				onSkip={onSkip}
				onAddTime={onAddTime}
				onToggleMute={onToggleMute}
			/>
		</div>
	);
}
