import type { CSSProperties } from 'react';

import { type Entry, entries } from '@/config/career';

export type PlacedEntry = Entry & {
	left: string;
	width: string;
};

const currentMonth = new Date().toISOString().slice(0, 7);

const toYears = (month: string) => {
	const [year, monthNumber] = month.split('-').map(Number);
	return year + (monthNumber - 1) / 12;
};

const endOf = (entry: Entry) =>
	entry.end === 'present' ? currentMonth : entry.end;

const months = (entry: Entry) =>
	Math.round((toYears(endOf(entry)) - toYears(entry.start)) * 12) + 1;

export const firstYear = Math.floor(
	Math.min(...entries.map((entry) => toYears(entry.start))),
);
export const lastYear = Math.ceil(
	Math.max(...entries.map((entry) => toYears(endOf(entry)))),
);
export const span = lastYear - firstYear;
export const years = Array.from({ length: span + 1 }, (_, i) => firstYear + i);
export const focusYear = Math.ceil(toYears(currentMonth) + 1 / 12);
export const newestFirst = entries.toSorted((a, b) =>
	b.start.localeCompare(a.start),
);

export const percent = (years: number) => `${(years / span) * 100}%`;

const overlapGroups = (list: Entry[]) => {
	const groups: Entry[][] = [];
	for (const entry of list.toSorted((a, b) => a.start.localeCompare(b.start))) {
		const group = groups.at(-1);
		if (group?.some((other) => endOf(other) >= entry.start)) group.push(entry);
		else groups.push([entry]);
	}
	return groups;
};

const assignLanes = (list: Entry[]) => {
	const laneEnds: string[] = [];
	const lanes = list.map((entry) => {
		const free = laneEnds.findIndex((end) => end < entry.start);
		const lane = free === -1 ? laneEnds.length : free;
		laneEnds[lane] = endOf(entry);
		return lane;
	});
	return { lanes, count: laneEnds.length };
};

const sideWidth = '2rem';

export const layout = (kind: Entry['kind']): PlacedEntry[] =>
	overlapGroups(entries.filter((entry) => entry.kind === kind)).flatMap(
		(group) => {
			const main = group.filter((entry) => !entry.side);
			const side = group.filter((entry) => entry.side);
			const mainLanes = assignLanes(main);
			const sideLanes = assignLanes(side);
			const width = `(100% - ${sideLanes.count} * ${sideWidth}) / ${mainLanes.count}`;

			return [
				...main.map((entry, i) => ({
					...entry,
					left: `calc(${mainLanes.lanes[i]} * ${width})`,
					width: `calc(${width} - 4px)`,
				})),
				...side.map((entry, i) => ({
					...entry,
					left: `calc(100% - ${sideLanes.lanes[i] + 1} * ${sideWidth})`,
					width: `calc(${sideWidth} - 4px)`,
				})),
			];
		},
	);

export const position = (entry: PlacedEntry) =>
	({
		'--x': percent(toYears(entry.start) - firstYear),
		'--size': percent(months(entry) / 12),
		'--left': entry.left,
		'--width': entry.width,
	}) as CSSProperties;
