import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ApneaTable, Phase } from '@/utils/apnea-tables';
import {
	playBreatheStart,
	playCountdownTick,
	playHoldStart,
	playSessionComplete,
	playWarningBeep,
} from '@/utils/apnea-audio';

export type TimerState = 'idle' | 'running' | 'paused' | 'finished';

type UseApneaTimerReturn = {
	state: TimerState;
	currentRound: number;
	totalRounds: number;
	currentPhase: Phase;
	timeRemaining: number;
	phaseDuration: number;
	progress: number; // 0-1, fraction of phase elapsed
	isMuted: boolean;

	start: () => void;
	pause: () => void;
	resume: () => void;
	stop: () => void;
	skipPhase: () => void;
	addTime: (seconds: number) => void;
	toggleMute: () => void;
};

export default function useApneaTimer(
	table: ApneaTable | null,
): UseApneaTimerReturn {
	const [state, setState] = useState<TimerState>('idle');
	const [currentRound, setCurrentRound] = useState(0);
	const [currentPhase, setCurrentPhase] = useState<Phase>('breathe');
	const [timeRemaining, setTimeRemaining] = useState(0);
	const [phaseDuration, setPhaseDuration] = useState(0);
	const [isMuted, setIsMuted] = useState(false);

	const lastTickRef = useRef(0);
	const rafRef = useRef(0);
	const remainingRef = useRef(0);
	const mutedRef = useRef(false);
	const lastDisplayedSecondRef = useRef(-1);
	const lastSoundSecondRef = useRef(-1);

	// Keep refs in sync
	useEffect(() => {
		mutedRef.current = isMuted;
	}, [isMuted]);


	const playSound = useCallback((fn: () => void) => {
		if (!mutedRef.current) fn();
	}, []);

	const goToPhase = useCallback(
		(round: number, phase: Phase) => {
			if (!table) return;
			if (round >= table.rounds.length) {
				// Training complete
				setState('finished');
				playSound(playSessionComplete);
				return;
			}

			const duration =
				phase === 'breathe'
					? table.rounds[round].breathe
					: table.rounds[round].hold;
			setCurrentRound(round);
			setCurrentPhase(phase);
			setTimeRemaining(duration);
			setPhaseDuration(duration);
			remainingRef.current = duration;
			lastDisplayedSecondRef.current = duration;
			lastSoundSecondRef.current = -1;

			if (phase === 'breathe') {
				playSound(playBreatheStart);
			} else {
				playSound(playHoldStart);
			}
		},
		[table, playSound],
	);

	const nextPhase = useCallback(() => {
		if (!table) return;
		if (currentPhase === 'breathe') {
			goToPhase(currentRound, 'hold');
		} else {
			goToPhase(currentRound + 1, 'breathe');
		}
	}, [table, currentPhase, currentRound, goToPhase]);

	// Main timer loop using requestAnimationFrame
	useEffect(() => {
		if (state !== 'running') return;

		lastTickRef.current = performance.now();

		const tick = (now: number) => {
			const delta = (now - lastTickRef.current) / 1000;
			lastTickRef.current = now;

			remainingRef.current -= delta;

			if (remainingRef.current <= 0) {
				remainingRef.current = 0;
				setTimeRemaining(0);
				nextPhase();
				return;
			}

			// Only update state when the displayed second changes
			const rounded = Math.ceil(remainingRef.current);
			if (rounded !== lastDisplayedSecondRef.current) {
				lastDisplayedSecondRef.current = rounded;
				setTimeRemaining(rounded);

				// Sound cues — fire once per second boundary
				if (rounded !== lastSoundSecondRef.current) {
					lastSoundSecondRef.current = rounded;
					if (rounded === 10) {
						playSound(playWarningBeep);
					}
					if (rounded <= 3 && rounded >= 1) {
						playSound(playCountdownTick);
					}
				}
			}

			rafRef.current = requestAnimationFrame(tick);
		};

		rafRef.current = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(rafRef.current);
		};
	}, [state, nextPhase, playSound]);

	const start = useCallback(() => {
		if (!table || table.rounds.length === 0) return;
		setState('running');
		goToPhase(0, 'breathe');
	}, [table, goToPhase]);

	const pause = useCallback(() => {
		setState('paused');
	}, []);

	const resume = useCallback(() => {
		setState('running');
	}, []);

	const stop = useCallback(() => {
		setState('idle');
		cancelAnimationFrame(rafRef.current);
		setCurrentRound(0);
		setCurrentPhase('breathe');
		setTimeRemaining(0);
		setPhaseDuration(0);
	}, []);

	const skipPhase = useCallback(() => {
		if (state !== 'running' && state !== 'paused') return;
		if (state === 'paused') setState('running');
		nextPhase();
	}, [state, nextPhase]);

	const addTime = useCallback((seconds: number) => {
		remainingRef.current += seconds;
		const rounded = Math.ceil(remainingRef.current);
		lastDisplayedSecondRef.current = rounded;
		setTimeRemaining(rounded);
		setPhaseDuration((prev) => prev + seconds);
	}, []);

	const toggleMute = useCallback(() => {
		setIsMuted((prev) => !prev);
	}, []);

	const progress = useMemo(
		() => (phaseDuration > 0 ? 1 - timeRemaining / phaseDuration : 0),
		[phaseDuration, timeRemaining],
	);

	return {
		state,
		currentRound,
		totalRounds: table?.rounds.length ?? 0,
		currentPhase,
		timeRemaining,
		phaseDuration,
		progress,
		isMuted,
		start,
		pause,
		resume,
		stop,
		skipPhase,
		addTime,
		toggleMute,
	};
}
