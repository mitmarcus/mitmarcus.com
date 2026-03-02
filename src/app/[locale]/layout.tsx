// Vercel Analytics
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
//
import { Metadata, Viewport } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import Footer from '@/components/footer';
import Header from '@/components/header';
import ScrollToTop from '@/components/scroll-to-top';
import { fontNoto, fontSans } from '@/config/fonts';
import { siteConfig } from '@/config/site';
import { locales } from '@/lib/navigation';
import LocaleProvider from '@/providers/locale-provider';
import '@/styles/app.css';
import { cn } from '@/utils/cn';
import { getLocalizedUrl } from '@/utils/url';

export const viewport: Viewport = {
	themeColor: {
		color: '#060609',
	},
};

export async function generateMetadata({
	params,
}: {
	params: { locale: Locale };
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'homePage' });
	const url = getLocalizedUrl({ locale });

	return {
		metadataBase: new URL(siteConfig.siteUrl),
		title: {
			default: siteConfig.name,
			template: `%s - ${siteConfig.name}`,
		},
		creator: siteConfig.name,
		description: t('description'),
		openGraph: {
			...siteConfig.openGraph,
			url,
			locale,
			description: t('description'),
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				'max-video-preview': -1,
				'max-image-preview': 'large',
				'max-snippet': -1,
			},
		},
		alternates: {
			canonical: url,
		},
		icons: {
			icon: '/favicon.ico',
			shortcut: '/favicon-32x32.png',
			apple: '/apple-touch-icon.png',
		},
		manifest: '/manifest.json',
	};
}

export const generateStaticParams = () => {
	return locales.map((locale) => ({ locale }));
};

type RootLayoutProps = {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
};

const RootLayout = async (props: RootLayoutProps) => {
	const params = await props.params;
	const { locale } = params;
	const { children } = props;

	if (!locales.includes(locale as any)) {
		notFound();
	}

	return (
		<html
			className={cn(fontSans.variable, fontNoto.variable)}
			lang={locale}
		>
			<body className='min-h-screen'>
				<LocaleProvider>
					<Header />
					<main className='layout mt-16 min-h-[calc(100vh_-_56px_-_196px)]'>
						{children}
						{/* Vercel */}
						<Analytics />
						<SpeedInsights />
					</main>
					<Footer />
					<ScrollToTop />
				</LocaleProvider>
			</body>
		</html>
	);
};

export default RootLayout;
