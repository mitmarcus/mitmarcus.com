'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { Phase } from '@/utils/apnea/apnea-tables';
import { formatTime } from '@/utils/apnea/apnea-tables';

type PipState = {
	phase: Phase;
	timeRemaining: number;
	phaseDuration: number;
	progress: number;
	currentRound: number;
	totalRounds: number;
	tableName: string;
};

type WebkitVideoElement = HTMLVideoElement & {
	webkitSupportsPresentationMode?: (mode: string) => boolean;
	webkitSetPresentationMode?: (mode: string) => void;
	webkitPresentationMode?: string;
};

const CANVAS_SIZE = 400;
const CENTER = CANVAS_SIZE / 2;
const RING_SIZE = 260;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CY = 200;
const FONT_STACK =
	'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

function drawPills(
	ctx: CanvasRenderingContext2D,
	s: PipState,
	phaseColor: string,
	cy: number,
) {
	const pillHeight = 6;
	const smallW = 6;
	const currentW = 24;
	const gap = 6;

	const widths = Array.from({ length: s.totalRounds }, (_, i) =>
		i === s.currentRound ? currentW : smallW,
	);
	const totalW =
		widths.reduce((sum, w) => sum + w, 0) + gap * (s.totalRounds - 1);
	let x = CENTER - totalW / 2;

	for (let i = 0; i < s.totalRounds; i++) {
		const w = widths[i];
		const completed = i < s.currentRound;
		const current = i === s.currentRound;

		ctx.beginPath();
		const r = pillHeight / 2;
		ctx.moveTo(x + r, cy - r);
		ctx.lineTo(x + w - r, cy - r);
		ctx.arc(x + w - r, cy, r, -Math.PI / 2, Math.PI / 2);
		ctx.lineTo(x + r, cy + r);
		ctx.arc(x + r, cy, r, Math.PI / 2, -Math.PI / 2);
		ctx.closePath();

		if (completed) {
			ctx.strokeStyle = 'hsl(220, 8%, 14%)';
			ctx.lineWidth = 1;
			ctx.stroke();
		} else if (current) {
			ctx.fillStyle = phaseColor;
			ctx.fill();
		} else {
			ctx.fillStyle = '#404040';
			ctx.fill();
		}

		x += w + gap;
	}
}

function draw(ctx: CanvasRenderingContext2D, s: PipState) {
	const isHold = s.phase === 'hold';
	const phaseColor = isHold ? '#fbbf24' : '#60a5fa';
	const phaseLabel = isHold ? 'HOLD' : 'BREATHE';

	ctx.fillStyle = '#0a0a0a';
	ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = 'rgba(250, 250, 250, 0.4)';
	ctx.font = `400 14px ${FONT_STACK}`;
	ctx.fillText(
		`${s.tableName}   ·   Round ${s.currentRound + 1} / ${s.totalRounds}`,
		CENTER,
		48,
	);

	ctx.beginPath();
	ctx.arc(CENTER, RING_CY, RING_RADIUS, 0, Math.PI * 2);
	ctx.strokeStyle = 'rgba(38, 38, 38, 0.5)';
	ctx.lineWidth = RING_STROKE;
	ctx.stroke();

	const start = -Math.PI / 2;
	const end = start + Math.PI * 2 * s.progress;
	ctx.beginPath();
	ctx.arc(CENTER, RING_CY, RING_RADIUS, start, end);
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
	ctx.fillText(phaseLabel, CENTER, RING_CY - 34);
	(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
		'0px';

	ctx.fillStyle = '#fafafa';
	ctx.font = `700 48px ${FONT_STACK}`;
	ctx.fillText(formatTime(s.timeRemaining), CENTER, RING_CY + 4);

	ctx.fillStyle = 'rgba(250, 250, 250, 0.3)';
	ctx.font = `400 14px ${FONT_STACK}`;
	ctx.fillText(`of ${formatTime(s.phaseDuration)}`, CENTER, RING_CY + 40);

	drawPills(ctx, s, phaseColor, 362);
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
	const [isActive, setIsActive] = useState(false);

	stateRef.current = state;

	const renderLoop = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		draw(ctx, stateRef.current);
		rafRef.current = requestAnimationFrame(renderLoop);
	}, []);

	const stopLoop = useCallback(() => {
		if (rafRef.current !== null) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
	}, []);

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

		if (!rafRef.current) renderLoop();

		if (!video.srcObject) {
			const stream = canvas.captureStream(30);
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
		} catch {
			stopLoop();
		}
	}, [renderLoop, stopLoop]);

	useEffect(() => {
		const video = videoRef.current as WebkitVideoElement | null;
		if (!video) return;

		const onEnter = () => setIsActive(true);
		const onLeave = () => {
			setIsActive(false);
			stopLoop();
		};
		const onWebkitChange = () => {
			const active = video.webkitPresentationMode === 'picture-in-picture';
			setIsActive(active);
			if (!active) stopLoop();
		};

		video.addEventListener('enterpictureinpicture', onEnter);
		video.addEventListener('leavepictureinpicture', onLeave);
		video.addEventListener(
			'webkitpresentationmodechanged',
			onWebkitChange as EventListener,
		);

		return () => {
			video.removeEventListener('enterpictureinpicture', onEnter);
			video.removeEventListener('leavepictureinpicture', onLeave);
			video.removeEventListener(
				'webkitpresentationmodechanged',
				onWebkitChange as EventListener,
			);
			stopLoop();
		};
	}, [stopLoop]);

	return {
		canvasRef,
		videoRef,
		isActive,
		enter,
		exit,
		canvasSize: CANVAS_SIZE,
	};
}
