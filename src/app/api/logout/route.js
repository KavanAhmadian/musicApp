export const runtime = 'nodejs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const cookieStore = cookies();

        // Clear all authentication cookies
        cookieStore.delete('session_token');
        cookieStore.delete('user_info');

        return NextResponse.json(
            { message: 'خروج موفق' },
            {
                headers: {
                    'Set-Cookie': `session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
                    'Set-Cookie': `user_info=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
                }
            }
        );
    } catch (err) {
        return NextResponse.json(
            { msg: 'Server error' },
            { status: 500 }
        );
    }
}