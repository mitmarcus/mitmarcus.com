let audioCtx: AudioContext | null = null;

type OscillatorType = 'custom' | 'sawtooth' | 'sine' | 'square' | 'triangle';

function vibrate(pattern: number | number[]): void {
	try {
		navigator?.vibrate?.(pattern);
	} catch {
		// Vibration API not available
	}
}

function getAudioContext(): AudioContext {
	if (!audioCtx) {
		audioCtx = new AudioContext();
	}
	if (audioCtx.state === 'suspended') {
		audioCtx.resume();
	}
	return audioCtx;
}

type BeepOptions = {
	frequency?: number;
	duration?: number;
	volume?: number;
	type?: OscillatorType;
};

function beep({
	frequency = 660,
	duration = 150,
	volume = 0.3,
	type = 'sine',
}: BeepOptions = {}): void {
	try {
		const ctx = getAudioContext();
		const oscillator = ctx.createOscillator();
		const gain = ctx.createGain();

		oscillator.type = type;
		oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

		gain.gain.setValueAtTime(volume, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(
			0.001,
			ctx.currentTime + duration / 1000,
		);

		oscillator.connect(gain);
		gain.connect(ctx.destination);

		oscillator.start(ctx.currentTime);
		oscillator.stop(ctx.currentTime + duration / 1000);
	} catch {
		// Audio not available
	}
}

/** Tick sound for countdown (3, 2, 1) */
export function playCountdownTick(): void {
	beep({ frequency: 880, duration: 100, volume: 0.25 });
	vibrate(50);
}

/** Phase transition - breathe phase starts */
export function playBreatheStart(): void {
	beep({ frequency: 523, duration: 300, volume: 0.3 });
	setTimeout(() => beep({ frequency: 659, duration: 200, volume: 0.2 }), 200);
	vibrate([100, 50, 100]);
}

/** Phase transition - hold phase starts */
export function playHoldStart(): void {
	beep({ frequency: 440, duration: 400, volume: 0.35 });
	vibrate(200);
}

/** Training session complete */
export function playSessionComplete(): void {
	const notes = [523, 659, 784, 1047];
	notes.forEach((freq, i) => {
		setTimeout(
			() => beep({ frequency: freq, duration: 250, volume: 0.25 }),
			i * 200,
		);
	});
	vibrate([100, 80, 100, 80, 100, 80, 200]);
}

/** Warning beep at 10 seconds remaining */
export function playWarningBeep(): void {
	beep({ frequency: 700, duration: 80, volume: 0.15 });
	vibrate([50, 30, 50]);
}

/** Contraction marked */
export function playContractionMark(): void {
	beep({ frequency: 350, duration: 150, volume: 0.2 });
	vibrate(100);
}

/** Ensure AudioContext is initialized */
export function initAudio(): void {
	getAudioContext();
}
