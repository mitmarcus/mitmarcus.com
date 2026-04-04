import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata, Viewport } from 'next';

import Footer from '@/components/footer';
import InstaHeader from '@/components/insta/insta-header';
import ScrollToTop from '@/components/scroll-to-top';
import { fontNoto, fontSans } from '@/config/fonts';
import { siteConfig } from '@/config/site';
import '@/styles/app.css';
import { cn } from '@/utils/cn';

export const viewport: Viewport = {
	themeColor: {
		color: '#060609',
	},
};

export const metadata: Metadata = {
	metadataBase: new URL(siteConfig.instaUrl),
	title: 'Photos - Marcus Mitelea',
	description: 'Archived Instagram media',
	openGraph: {
		title: 'Photos - Marcus Mitelea',
		description: 'Archived Instagram media',
		url: siteConfig.instaUrl,
	},
	robots: {
		index: false,
		follow: false,
	},
};

type InstaLayoutProps = {
	children: React.ReactNode;
};

export default function InstaLayout({ children }: InstaLayoutProps) {
	return (
		<html
			className={cn(fontSans.variable, fontNoto.variable)}
			lang='en'
		>
			<body className='min-h-screen'>
				<InstaHeader />
				<main className='mx-auto max-w-6xl mt-16 px-6 min-h-[calc(100vh_-_56px_-_64px)]'>
					{children}
				</main>
				<Footer />
				<ScrollToTop />
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
