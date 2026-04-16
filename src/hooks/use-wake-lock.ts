import { useEffect } from 'react';

type WakeLockSentinel = {
	release: () => Promise<void>;
};

type WakeLockNavigator = Navigator & {
	wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> };
};

export default function useWakeLock(active: boolean): void {
	useEffect(() => {
		if (!active) return;
		if (typeof navigator === 'undefined') return;
		const nav = navigator as WakeLockNavigator;
		if (!nav.wakeLock) return;

		let sentinel: WakeLockSentinel | null = null;
		let cancelled = false;

		const acquire = async () => {
			try {
				const s = await nav.wakeLock?.request('screen');
				if (cancelled) {
					s.release().catch(() => {});
					return;
				}
				sentinel = s;
			} catch {
				// user denied or unsupported
			}
		};

		const onVisibility = () => {
			if (document.visibilityState === 'visible' && !sentinel && !cancelled) {
				acquire();
			}
		};

		acquire();
		document.addEventListener('visibilitychange', onVisibility);

		return () => {
			cancelled = true;
			document.removeEventListener('visibilitychange', onVisibility);
			sentinel?.release().catch(() => {});
			sentinel = null;
		};
	}, [active]);
}
