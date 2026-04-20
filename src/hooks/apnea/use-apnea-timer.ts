import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	initAudio,
	playBreatheStart,
	playCountdownTick,
	playHoldStart,
	playSessionComplete,
	playWarningBeep,
} from '@/utils/apnea/apnea-audio';
import type { ApneaTable, Phase } from '@/utils/apnea/apnea-tables';

export type TimerState = 'idle' | 'running' | 'paused' | 'finished';

type UseApneaTimerOptions = {
	initialMuted?: boolean;
	onMutedChange?: (muted: boolean) => void;
};

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
	{ initialMuted = false, onMutedChange }: UseApneaTimerOptions = {},
): UseApneaTimerReturn {
	const [state, setState] = useState<TimerState>('idle');
	const [currentRound, setCurrentRound] = useState(0);
	const [currentPhase, setCurrentPhase] = useState<Phase>('breathe');
	const [timeRemaining, setTimeRemaining] = useState(0);
	const [phaseDuration, setPhaseDuration] = useState(0);
	const [isMuted, setIsMuted] = useState(initialMuted);

	const rafRef = useRef(0);
	const endTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const phaseEndRef = useRef(0); // performance.now() timestamp of phase end
	const remainingRef = useRef(0); // seconds; authoritative while paused/idle
	const mutedRef = useRef(initialMuted);
	const lastDisplayedSecondRef = useRef(-1);
	const lastSoundSecondRef = useRef(-1);

	useEffect(() => {
		mutedRef.current = isMuted;
	}, [isMuted]);

	const playSound = useCallback((fn: () => void) => {
		if (!mutedRef.current) fn();
	}, []);

	const clearEndTimeout = useCallback(() => {
		if (endTimeoutRef.current) {
			clearTimeout(endTimeoutRef.current);
			endTimeoutRef.current = null;
		}
	}, []);

	const goToPhase = useCallback(
		(round: number, phase: Phase) => {
			if (!table) return;
			if (round >= table.rounds.length) {
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
			phaseEndRef.current = performance.now() + duration * 1000;
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

	// Run while state === 'running'. Wall-clock anchored: rAF updates the display,
	// setTimeout guarantees phase end fires even when the tab is backgrounded.
	useEffect(() => {
		if (state !== 'running') return;

		// Re-anchor end time from whatever remaining we snapshotted on pause/start.
		phaseEndRef.current = performance.now() + remainingRef.current * 1000;

		const scheduleEnd = () => {
			clearEndTimeout();
			const ms = Math.max(0, phaseEndRef.current - performance.now());
			endTimeoutRef.current = setTimeout(() => {
				endTimeoutRef.current = null;
				remainingRef.current = 0;
				setTimeRemaining(0);
				nextPhase();
			}, ms);
		};

		const tick = () => {
			const remaining = (phaseEndRef.current - performance.now()) / 1000;
			if (remaining <= 0) {
				// setTimeout will handle the transition; stop animating.
				return;
			}
			remainingRef.current = remaining;

			const rounded = Math.ceil(remaining);
			if (rounded !== lastDisplayedSecondRef.current) {
				lastDisplayedSecondRef.current = rounded;
				setTimeRemaining(rounded);

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

		scheduleEnd();
		rafRef.current = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(rafRef.current);
			clearEndTimeout();
		};
	}, [state, nextPhase, playSound, clearEndTimeout]);

	const start = useCallback(() => {
		if (!table || table.rounds.length === 0) return;
		initAudio();
		setState('running');
		goToPhase(0, 'breathe');
	}, [table, goToPhase]);

	const pause = useCallback(() => {
		// Snapshot actual remaining from the wall clock before stopping.
		remainingRef.current = Math.max(
			0,
			(phaseEndRef.current - performance.now()) / 1000,
		);
		setState('paused');
	}, []);

	const resume = useCallback(() => {
		initAudio();
		setState('running');
	}, []);

	const stop = useCallback(() => {
		cancelAnimationFrame(rafRef.current);
		clearEndTimeout();
		setState('idle');
		setCurrentRound(0);
		setCurrentPhase('breathe');
		setTimeRemaining(0);
		setPhaseDuration(0);
		remainingRef.current = 0;
	}, [clearEndTimeout]);

	const skipPhase = useCallback(() => {
		if (state !== 'running' && state !== 'paused') return;
		// Advance phase info. If paused, remain paused - goToPhase refreshes
		// remainingRef and the running effect will re-anchor on resume.
		nextPhase();
	}, [state, nextPhase]);

	const addTime = useCallback(
		(seconds: number) => {
			if (state === 'running') {
				phaseEndRef.current += seconds * 1000;
				remainingRef.current = (phaseEndRef.current - performance.now()) / 1000;
				// Reschedule the end timeout against the new end time.
				clearEndTimeout();
				const ms = Math.max(0, phaseEndRef.current - performance.now());
				endTimeoutRef.current = setTimeout(() => {
					endTimeoutRef.current = null;
					remainingRef.current = 0;
					setTimeRemaining(0);
					nextPhase();
				}, ms);
			} else {
				remainingRef.current += seconds;
			}
			const rounded = Math.ceil(remainingRef.current);
			lastDisplayedSecondRef.current = rounded;
			setTimeRemaining(rounded);
			setPhaseDuration((prev) => prev + seconds);
		},
		[state, nextPhase, clearEndTimeout],
	);

	const toggleMute = useCallback(() => {
		setIsMuted((prev) => {
			const next = !prev;
			onMutedChange?.(next);
			return next;
		});
	}, [onMutedChange]);

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
