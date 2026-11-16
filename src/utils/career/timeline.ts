import type { CSSProperties } from 'react';

import { type Entry, entries } from '@/config/career';

export type PlacedEntry = Entry & {
	strip: boolean;
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

export const isLong = (entry: Entry) => months(entry) >= 10;

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

export const layout = (kind: Entry['kind']): PlacedEntry[] =>
	overlapGroups(entries.filter((entry) => entry.kind === kind)).flatMap(
		(group) => {
			const strips = group.some((entry) => !isLong(entry))
				? group.filter(isLong)
				: [];
			const cards = group.filter((entry) => !strips.includes(entry));
			const stripLanes = assignLanes(strips);
			const cardLanes = assignLanes(cards);
			const stripsWidth = `${stripLanes.count * 3}rem`;
			const cardWidth = `(100% - ${stripsWidth}) / ${cardLanes.count}`;

			return [
				...strips.map((entry, i) => ({
					...entry,
					strip: true,
					left: `${stripLanes.lanes[i] * 3}rem`,
					width: '2.75rem',
				})),
				...cards.map((entry, i) => ({
					...entry,
					strip: false,
					left: `calc(${stripsWidth} + ${cardLanes.lanes[i]} * ${cardWidth})`,
					width: `calc(${cardWidth} - 4px)`,
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
