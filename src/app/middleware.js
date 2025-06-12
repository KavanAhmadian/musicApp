// middleware.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function middleware(request) {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session_token');

    // If no token and trying to access protected route
    if (!sessionToken && request.nextUrl.pathname.startsWith('/my-beatbox')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}