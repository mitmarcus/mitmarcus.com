import { siteConfig } from '@/config/site';
import { defaultLocale } from '@/lib/navigation';

export function getLocalizedUrl({
	locale,
	pathname = '',
	slug = '',
}: {
	locale: Locale;
	pathname?: '' | 'blog' | 'about' | 'projects';
	slug?: string;
}) {
	const localPrefix = locale === defaultLocale ? '' : locale;

	const url = [siteConfig.siteUrl, localPrefix, pathname, slug]
		.filter((item) => item)
		.join('/');

	return url;
}
