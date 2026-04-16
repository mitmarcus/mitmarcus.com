import Link from 'next/link';
import { redirect, usePathname, useRouter } from 'next/navigation';
import type { DateTimeFormatOptions } from 'next-intl';

export const useMessages = () => ({});

export const useNow = () => new Date();

export const useTimeZone = () => 'CET';

export const useLocale = () => 'da';

export const useFormatter = () => {
	const formatter = (format: DateTimeFormatOptions) =>
		new Intl.DateTimeFormat('da', format);

	return {
		date: (date: Date, format: DateTimeFormatOptions) =>
			formatter(format).format(date),
		dateTime: (date: Date, format: DateTimeFormatOptions) =>
			formatter(format).format(date),
	};
};

export const useTranslations = () => {
	const t = (key: string) => key;

	t.rich = (key: string) => key;
	t.markup = (key: string) => key;

	return t;
};

export const NextIntlClientProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => children;

export const defineRouting = (config: Record<string, unknown>) => config;

export const createNavigation = () => ({
	Link: Link,
	redirect: redirect,
	usePathname: usePathname,
	useRouter: useRouter,
});
