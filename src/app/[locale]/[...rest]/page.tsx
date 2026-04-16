import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
	title: '404',
	description: 'Sorry, the page you are looking for does not exist.',
};

// Catching unknown routes
const CatchAllPage = () => {
	notFound();
};

export default CatchAllPage;
