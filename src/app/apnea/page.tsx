'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import ApneaHeader from '@/components/apnea/apnea-header';
import SetupForm from '@/components/apnea/setup-form';
import TrainingTimer from '@/components/apnea/training-timer';
import useApneaStorage from '@/hooks/apnea/use-apnea-storage';
import useApneaTimer from '@/hooks/apnea/use-apnea-timer';
import useWakeLock from '@/hooks/use-wake-lock';
import { initAudio } from '@/utils/apnea/apnea-audio';
import type { ApneaTable } from '@/utils/apnea/apnea-tables';
import { generateCO2Table, generateO2Table } from '@/utils/apnea/apnea-tables';
import { cn } from '@/utils/cn';

export default function ApneaPage() {
	const storage = useApneaStorage();
	const [view, setView] = useState<'setup' | 'training'>('setup');
	const [activeTable, setActiveTable] = useState<ApneaTable | null>(null);
	const shouldAutoStartRef = useRef(false);

	const timer = useApneaTimer(activeTable, {
		initialMuted: storage.data.isMuted,
		onMutedChange: storage.setMuted,
	});

	useWakeLock(timer.state === 'running');

	const handleSetPB = useCallback(
		(seconds: number, tableType: 'co2' | 'o2') => {
			storage.setPB(seconds);
			const table =
				tableType === 'co2'
					? generateCO2Table(seconds)
					: generateO2Table(seconds);
			setActiveTable(table);
			initAudio();
			shouldAutoStartRef.current = true;
			setView('training');
		},
		[storage],
	);

	useEffect(() => {
		if (
			shouldAutoStartRef.current &&
			view === 'training' &&
			activeTable &&
			timer.state === 'idle'
		) {
			shouldAutoStartRef.current = false;
			timer.start();
		}
	}, [view, activeTable, timer]);

	const handleStopTraining = useCallback(() => {
		timer.stop();
		setView('setup');
	}, [timer]);

	return (
		<>
			<ApneaHeader />

			<main
				className={cn(
					'layout my-8 min-h-[calc(100vh-56px-64px)]',
					'flex items-center justify-center',
				)}
			>
				{view === 'setup' && storage.isLoaded && (
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
