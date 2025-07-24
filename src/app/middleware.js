import { NextResponse } from 'next/server';

export async function middleware(request) {
    const sessionToken = request.cookies.get('session_token');

    if (
        !sessionToken &&
        request.nextUrl.pathname.startsWith('/my-beatbox')
    ) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}
