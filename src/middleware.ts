import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
	const host = request.headers.get('host') ?? '';

	// Subdomain: insta.mitmarcus.com or insta.localhost:3000 → serve /insta
	if (host.startsWith('insta.')) {
		const url = request.nextUrl.clone();
		// Only rewrite if not already pointing at /insta
		if (!url.pathname.startsWith('/insta')) {
			url.pathname = `/insta${url.pathname === '/' ? '' : url.pathname}`;
			return NextResponse.rewrite(url);
		}
		return NextResponse.next();
	}

	// Block direct /insta access, only available via subdomain
	if (request.nextUrl.pathname.startsWith('/insta')) {
		return NextResponse.redirect(new URL('/', request.url));
	}

	return intlMiddleware(request);
}

export const config = {
	matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
