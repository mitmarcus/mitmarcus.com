import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';

import Footer from '@/components/footer';
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
	metadataBase: new URL(siteConfig.apneaUrl),
	title: {
		default: 'Apnea Trainer - Marcus Mitelea',
		template: `%s - Apnea Trainer`,
	},
	creator: siteConfig.name,
	description: 'Freediving apnea breath-hold trainer with CO₂ and O₂ tables',
	openGraph: {
		...siteConfig.apneaOpenGraph,
	},
	robots: {
		index: true,
		follow: true,
	},
	icons: {
		icon: '/favicon.ico',
		shortcut: '/favicon-32x32.png',
		apple: '/apple-touch-icon.png',
	},
};

type ApneaLayoutProps = {
	children: React.ReactNode;
};

export default function ApneaLayout({ children }: ApneaLayoutProps) {
	return (
		<html className={cn(fontSans.variable, fontNoto.variable)} lang='en'>
			<body className='min-h-screen'>
				{children}
				<Footer />
				<ScrollToTop />
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
