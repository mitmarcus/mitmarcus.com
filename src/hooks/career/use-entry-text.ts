import { useFormatter, useTranslations } from 'next-intl';

import type { Entry } from '@/config/career';

export type EntryText = {
	title: string;
	org: string;
	short?: string;
	meta?: string;
	points?: string[];
	skills?: string;
};

export default function useEntryText() {
	const t = useTranslations('experience');
	const format = useFormatter();

	const text = (entry: Entry) => t.raw(`items.${entry.id}`) as EntryText;

	const dates = (entry: Entry, withYear = false) => {
		const options =
			entry.kind === 'education'
				? ({ year: 'numeric' } as const)
				: ({ month: 'short', year: withYear ? 'numeric' : undefined } as const);
		const formatMonth = (month: string) =>
			format.dateTime(new Date(`${month}-01T00:00:00Z`), {
				...options,
				timeZone: 'UTC',
			});
		const end = entry.end === 'present' ? t('present') : formatMonth(entry.end);
		return `${formatMonth(entry.start)} - ${end}`;
	};

	return { t, text, dates };
}
