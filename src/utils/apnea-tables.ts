export type TableType = 'co2' | 'o2' | 'custom';

export type Phase = 'breathe' | 'hold';

export type Round = {
	breathe: number; // seconds
	hold: number; // seconds
};

export type ApneaTable = {
	id: string;
	name: string;
	type: TableType;
	rounds: Round[];
	basePB: number; // the PB (seconds) this table was generated from
};

/**
 * CO2 Tolerance Table:
 * Fixed hold time (50% PB), decreasing rest/breathe time.
 * Starts at 2:00 rest, decreases by 15s each round down to minimum 15s.
 * 8 rounds.
 */
export function generateCO2Table(pbSeconds: number): ApneaTable {
	const holdTime = Math.round(pbSeconds * 0.5);
	const rounds: Round[] = [];
	const numRounds = 8;
	const startRest = 120; // 2:00
	const restStep = 15;
	const minRest = 15;

	for (let i = 0; i < numRounds; i++) {
		const breathe = Math.max(startRest - i * restStep, minRest);
		rounds.push({ breathe, hold: holdTime });
	}

	return {
		id: `co2-${pbSeconds}`,
		name: 'CO₂ Table',
		type: 'co2',
		rounds,
		basePB: pbSeconds,
	};
}

/**
 * O2 Depletion Table:
 * Fixed rest time (2:00), increasing hold time.
 * Starts at 40% of PB, increases evenly to 80% of PB.
 * 8 rounds.
 */
export function generateO2Table(pbSeconds: number): ApneaTable {
	const rounds: Round[] = [];
	const numRounds = 8;
	const fixedRest = 120; // 2:00
	const startHold = Math.round(pbSeconds * 0.4);
	const endHold = Math.round(pbSeconds * 0.8);
	const holdStep = (endHold - startHold) / (numRounds - 1);

	for (let i = 0; i < numRounds; i++) {
		const hold = Math.round(startHold + i * holdStep);
		rounds.push({ breathe: fixedRest, hold });
	}

	return {
		id: `o2-${pbSeconds}`,
		name: 'O₂ Table',
		type: 'o2',
		rounds,
		basePB: pbSeconds,
	};
}

export function createCustomTable(name: string, rounds: Round[]): ApneaTable {
	return {
		id: `custom-${Date.now()}`,
		name,
		type: 'custom',
		rounds,
		basePB: 0,
	};
}

export function totalTableTime(table: ApneaTable): number {
	return table.rounds.reduce((sum, r) => sum + r.breathe + r.hold, 0);
}

export function formatTime(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, '0')}`;
}
