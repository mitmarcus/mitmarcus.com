import { useCallback, useEffect, useState } from 'react';

import type { ApneaTable } from '@/utils/apnea-tables';

const STORAGE_KEY = 'apnea-trainer-data';

export type ApneaData = {
	pbSeconds: number;
	customTables: ApneaTable[];
	isMuted: boolean;
};

const DEFAULT_DATA: ApneaData = {
	pbSeconds: 0,
	customTables: [],
	isMuted: false,
};

function loadFromLocalStorage(): ApneaData {
	if (typeof window === 'undefined') return DEFAULT_DATA;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULT_DATA;
		return { ...DEFAULT_DATA, ...JSON.parse(raw) };
	} catch {
		return DEFAULT_DATA;
	}
}

function saveToLocalStorage(data: ApneaData): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch {
		// Storage full or unavailable
	}
}

export default function useApneaStorage() {
	const [data, setData] = useState<ApneaData>(DEFAULT_DATA);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const local = loadFromLocalStorage();
		setData(local);
		setIsLoaded(true);
	}, []);

	const update = useCallback((updater: (prev: ApneaData) => ApneaData) => {
		setData((prev) => {
			const next = updater(prev);
			saveToLocalStorage(next);
			return next;
		});
	}, []);

	const setPB = useCallback(
		(seconds: number) => update((prev) => ({ ...prev, pbSeconds: seconds })),
		[update],
	);

	const setMuted = useCallback(
		(muted: boolean) => update((prev) => ({ ...prev, isMuted: muted })),
		[update],
	);

	const addCustomTable = useCallback(
		(table: ApneaTable) =>
			update((prev) => ({
				...prev,
				customTables: [...prev.customTables, table],
			})),
		[update],
	);

	const removeCustomTable = useCallback(
		(tableId: string) =>
			update((prev) => ({
				...prev,
				customTables: prev.customTables.filter((t) => t.id !== tableId),
			})),
		[update],
	);

	return {
		data,
		isLoaded,
		setPB,
		setMuted,
		addCustomTable,
		removeCustomTable,
	};
}
