import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import CareerJourney from '@/components/career/career-journey';
import MDXContent from '@/components/mdx';
import Panels from '@/components/panels';
import GradientText from '@/components/ui/gradient-text';
import { allPages } from '@/content';
import { getLocalizedUrl } from '@/utils/url';

export const generateMetadata = async (props: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> => {
	const params = await props.params;
	const t = await getTranslations();
	const url = getLocalizedUrl({
		locale: params.locale,
		pathname: 'about',
	});

	return {
		title: t('common.about'),
		description: t('aboutPage.description'),
		alternates: {
			canonical: url,
		},
	};
};

const AboutPage = () => {
	const t = useTranslations();
	const locale = useLocale() as Locale;
	const page = allPages.find(
		(page) => page.slug === 'about' && page.language === locale,
	);

	if (!page) {
		notFound();
	}

	return (
		<Panels
			title={
				<GradientText
					as='h1'
					className='animate-fade-in text-2xl font-bold tracking-tight'
				>
					{t('common.about')}
				</GradientText>
			}
			previousLabel={t('experience.previous')}
			nextLabel={t('experience.next')}
		>
			<section className='prose bg-card/40 p-5'>
				<MDXContent code={page.content} />
			</section>
			<CareerJourney />
		</Panels>
	);
};

export default AboutPage;
