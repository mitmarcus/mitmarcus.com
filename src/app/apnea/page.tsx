'use client';

import { useCallback, useState } from 'react';

import ApneaHeader from '@/components/apnea/apnea-header';
import SetupForm from '@/components/apnea/setup-form';
import TrainingTimer from '@/components/apnea/training-timer';
import useApneaStorage from '@/hooks/use-apnea-storage';
import useApneaTimer from '@/hooks/use-apnea-timer';
import { initAudio } from '@/utils/apnea-audio';
import type { ApneaTable } from '@/utils/apnea-tables';
import { generateCO2Table, generateO2Table } from '@/utils/apnea-tables';
import { cn } from '@/utils/cn';

export default function ApneaPage() {
	const storage = useApneaStorage();
	const [view, setView] = useState<'setup' | 'training'>(
		storage.data.pbSeconds > 0 ? 'training' : 'setup',
	);
	const [activeTable, setActiveTable] = useState<ApneaTable | null>(() =>
		storage.data.pbSeconds > 0
			? generateCO2Table(storage.data.pbSeconds)
			: null,
	);

	const timer = useApneaTimer(activeTable);

	const handleSetPB = useCallback(
		(seconds: number, tableType: 'co2' | 'o2') => {
			storage.setPB(seconds);
			const table =
				tableType === 'co2'
					? generateCO2Table(seconds)
					: generateO2Table(seconds);
			setActiveTable(table);
			initAudio();
			setView('training');
			setTimeout(() => timer.start(), 0);
		},
		[storage, timer],
	);

	const handleStopTraining = useCallback(() => {
		timer.stop();
		setView('setup');
	}, [timer]);

	return (
		<>
			<ApneaHeader />

			<main
				className={cn(
					'layout mx-auto max-w-lg mt-8 min-h-[calc(100vh_-_56px_-_64px)]',
					'flex items-center justify-center',
				)}
			>
				{view === 'setup' && (
					<SetupForm
						currentPB={storage.data.pbSeconds}
						onSubmit={handleSetPB}
					/>
				)}

				{view === 'training' && activeTable && (
					<TrainingTimer
						table={activeTable}
						timerState={timer.state}
						currentRound={timer.currentRound}
						totalRounds={timer.totalRounds}
						currentPhase={timer.currentPhase}
						timeRemaining={timer.timeRemaining}
						phaseDuration={timer.phaseDuration}
						progress={timer.progress}
						isMuted={timer.isMuted}
						onStart={timer.start}
						onPause={timer.pause}
						onResume={timer.resume}
						onStop={handleStopTraining}
						onSkip={timer.skipPhase}
						onAddTime={() => timer.addTime(10)}
						onToggleMute={timer.toggleMute}
					/>
				)}
			</main>
		</>
	);
}
