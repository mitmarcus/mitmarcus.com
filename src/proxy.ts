import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
	const host = request.headers.get('host') ?? '';

	// Subdomain: insta.mitmarcus.com or insta.localhost:3000 -> serve /insta
	if (host.startsWith('insta.')) {
		const url = request.nextUrl.clone();
		// Only rewrite if not already pointing at /insta
		if (!url.pathname.startsWith('/insta')) {
			url.pathname = `/insta${url.pathname === '/' ? '' : url.pathname}`;
			return NextResponse.rewrite(url);
		}
		return NextResponse.next();
	}

	// Subdomain: apneawip.mitmarcus.com or apneawip.localhost:3000 -> serve /apnea
	if (host.startsWith('apneawip.')) {
		const url = request.nextUrl.clone();
		if (!url.pathname.startsWith('/apnea')) {
			url.pathname = `/apnea${url.pathname === '/' ? '' : url.pathname}`;
			return NextResponse.rewrite(url);
		}
		return NextResponse.next();
	}

	// Block direct /insta and /apnea access, only available via subdomain
	if (
		request.nextUrl.pathname.startsWith('/insta') ||
		request.nextUrl.pathname.startsWith('/apnea')
	) {
		return NextResponse.redirect(new URL('/', request.url));
	}

	return intlMiddleware(request);
}

export const config = {
	matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
