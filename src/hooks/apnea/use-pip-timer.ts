'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { Phase } from '@/utils/apnea/apnea-tables';
import { formatTime } from '@/utils/apnea/apnea-tables';

type PipState = {
	phase: Phase;
	timeRemaining: number;
	phaseDuration: number;
	progress: number;
};

type WebkitVideoElement = HTMLVideoElement & {
	webkitSupportsPresentationMode?: (mode: string) => boolean;
	webkitSetPresentationMode?: (mode: string) => void;
	webkitPresentationMode?: string;
};

type WakeLockSentinel = {
	released: boolean;
	release: () => Promise<void>;
	addEventListener: (type: 'release', listener: () => void) => void;
};

type WakeLockNavigator = Navigator & {
	wakeLock?: {
		request: (type: 'screen') => Promise<WakeLockSentinel>;
	};
};

const CANVAS_SIZE = 300;
const CENTER = CANVAS_SIZE / 2;
const RING_SIZE = 260;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const FONT_STACK =
	'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

function draw(ctx: CanvasRenderingContext2D, s: PipState) {
	const isHold = s.phase === 'hold';
	const phaseColor = isHold ? '#fbbf24' : '#60a5fa';
	const phaseLabel = isHold ? 'HOLD' : 'BREATHE';

	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	ctx.beginPath();
	ctx.arc(CENTER, CENTER, RING_RADIUS, 0, Math.PI * 2);
	ctx.strokeStyle = 'rgba(38, 38, 38, 0.5)';
	ctx.lineWidth = RING_STROKE;
	ctx.stroke();

	const start = -Math.PI / 2;
	const end = start + Math.PI * 2 * s.progress;
	ctx.beginPath();
	ctx.arc(CENTER, CENTER, RING_RADIUS, start, end);
	ctx.strokeStyle = phaseColor;
	ctx.lineWidth = RING_STROKE;
	ctx.lineCap = 'round';
	ctx.shadowColor = `${phaseColor}66`;
	ctx.shadowBlur = 8;
	ctx.stroke();
	ctx.shadowBlur = 0;

	ctx.fillStyle = phaseColor;
	ctx.font = `500 12px ${FONT_STACK}`;
	(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
		'1.5px';
	ctx.fillText(phaseLabel, CENTER, CENTER - 34);
	(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
		'0px';

	ctx.fillStyle = '#fafafa';
	ctx.font = `700 48px ${FONT_STACK}`;
	ctx.fillText(formatTime(s.timeRemaining), CENTER, CENTER + 4);

	ctx.fillStyle = 'rgba(250, 250, 250, 0.3)';
	ctx.font = `400 14px ${FONT_STACK}`;
	ctx.fillText(`of ${formatTime(s.phaseDuration)}`, CENTER, CENTER + 40);
}

export function isPipSupported(): boolean {
	if (typeof document === 'undefined') return false;
	if (document.pictureInPictureEnabled) return true;
	const proto = HTMLVideoElement.prototype as WebkitVideoElement;
	return typeof proto.webkitSupportsPresentationMode === 'function';
}

export function usePipTimer(state: PipState) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const stateRef = useRef(state);
	const rafRef = useRef<number | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const audioCtxRef = useRef<AudioContext | null>(null);
	const wakeLockRef = useRef<WakeLockSentinel | null>(null);
	const [isActive, setIsActive] = useState(false);
	const isActiveRef = useRef(false);

	stateRef.current = state;
	isActiveRef.current = isActive;

	const drawFrame = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		draw(ctx, stateRef.current);
	}, []);

	const renderLoop = useCallback(() => {
		drawFrame();
		rafRef.current = requestAnimationFrame(renderLoop);
	}, [drawFrame]);

	const startLoop = useCallback(() => {
		if (rafRef.current === null) renderLoop();
		if (intervalRef.current === null) {
			intervalRef.current = setInterval(drawFrame, 500);
		}
	}, [renderLoop, drawFrame]);

	const stopLoop = useCallback(() => {
		if (rafRef.current !== null) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
		if (intervalRef.current !== null) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, []);

	const releaseWakeLock = useCallback(async () => {
		const lock = wakeLockRef.current;
		wakeLockRef.current = null;
		if (lock && !lock.released) {
			try {
				await lock.release();
			} catch {
				// ignore
			}
		}
	}, []);

	const requestWakeLock = useCallback(async () => {
		const nav = navigator as WakeLockNavigator;
		if (!nav.wakeLock) return;
		try {
			wakeLockRef.current = await nav.wakeLock.request('screen');
		} catch {
			// ignore — user may have denied or page not visible
		}
	}, []);

	const stopSilentAudio = useCallback(() => {
		const ctx = audioCtxRef.current;
		audioCtxRef.current = null;
		if (ctx) {
			ctx.close().catch(() => {});
		}
	}, []);

	const addSilentAudioTrack = useCallback((stream: MediaStream) => {
		try {
			const AudioCtor =
				window.AudioContext ||
				(window as unknown as { webkitAudioContext: typeof AudioContext })
					.webkitAudioContext;
			const ctx = new AudioCtor();
			audioCtxRef.current = ctx;
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			gain.gain.value = 0.0001;
			const dest = ctx.createMediaStreamDestination();
			osc.connect(gain).connect(dest);
			osc.start();
			for (const track of dest.stream.getAudioTracks()) {
				stream.addTrack(track);
			}
		} catch {
			// ignore — video-only stream still works
		}
	}, []);

	const cleanupMedia = useCallback(() => {
		stopLoop();
		stopSilentAudio();
		releaseWakeLock();
		const stream = streamRef.current;
		streamRef.current = null;
		if (stream) {
			for (const track of stream.getTracks()) track.stop();
		}
		const video = videoRef.current;
		if (video) video.srcObject = null;
	}, [stopLoop, stopSilentAudio, releaseWakeLock]);

	const exit = useCallback(async () => {
		const video = videoRef.current as WebkitVideoElement | null;
		try {
			if (document.pictureInPictureElement) {
				await document.exitPictureInPicture();
			} else if (video?.webkitSetPresentationMode) {
				video.webkitSetPresentationMode('inline');
			}
		} catch {
			// ignore
		}
	}, []);

	const enter = useCallback(async () => {
		const canvas = canvasRef.current;
		const video = videoRef.current as WebkitVideoElement | null;
		if (!canvas || !video) return;

		drawFrame();
		startLoop();

		if (!streamRef.current) {
			const stream = canvas.captureStream(30);
			addSilentAudioTrack(stream);
			streamRef.current = stream;
			video.srcObject = stream;
			video.muted = true;
			(video as HTMLVideoElement & { playsInline: boolean }).playsInline = true;
		}

		try {
			await video.play();
		} catch {
			// autoplay rejection is fine, PiP request still works
		}

		try {
			if (document.pictureInPictureEnabled) {
				await video.requestPictureInPicture();
			} else if (video.webkitSupportsPresentationMode?.('picture-in-picture')) {
				video.webkitSetPresentationMode?.('picture-in-picture');
			}
			await requestWakeLock();
		} catch {
			cleanupMedia();
		}
	}, [
		drawFrame,
		startLoop,
		addSilentAudioTrack,
		requestWakeLock,
		cleanupMedia,
	]);

	useEffect(() => {
		const video = videoRef.current as WebkitVideoElement | null;
		if (!video) return;

		const onEnter = () => setIsActive(true);
		const onLeave = () => {
			setIsActive(false);
			cleanupMedia();
		};
		const onWebkitChange = () => {
			const active = video.webkitPresentationMode === 'picture-in-picture';
			setIsActive(active);
			if (!active) cleanupMedia();
		};
		const onVisibilityChange = () => {
			if (document.visibilityState === 'visible' && isActiveRef.current) {
				requestWakeLock();
			}
		};
		const onPageHide = () => {
			cleanupMedia();
		};

		video.addEventListener('enterpictureinpicture', onEnter);
		video.addEventListener('leavepictureinpicture', onLeave);
		video.addEventListener(
			'webkitpresentationmodechanged',
			onWebkitChange as EventListener,
		);
		document.addEventListener('visibilitychange', onVisibilityChange);
		window.addEventListener('pagehide', onPageHide);

		return () => {
			video.removeEventListener('enterpictureinpicture', onEnter);
			video.removeEventListener('leavepictureinpicture', onLeave);
			video.removeEventListener(
				'webkitpresentationmodechanged',
				onWebkitChange as EventListener,
			);
			document.removeEventListener('visibilitychange', onVisibilityChange);
			window.removeEventListener('pagehide', onPageHide);
			cleanupMedia();
		};
	}, [cleanupMedia, requestWakeLock]);

	return {
		canvasRef,
		videoRef,
		isActive,
		enter,
		exit,
		canvasSize: CANVAS_SIZE,
	};
}
