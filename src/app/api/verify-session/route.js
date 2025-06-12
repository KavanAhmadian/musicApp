export const runtime = 'nodejs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const cookieStore = cookies();
        const sessionToken = cookieStore.get('session_token');

        if (!sessionToken) {
            return NextResponse.json(
                { valid: false },
                { status: 401 }
            );
        }

        // Add actual token verification logic here
        return NextResponse.json(
            { valid: true },
            { status: 200 }
        );
    } catch (err) {
        return NextResponse.json(
            { valid: false },
            { status: 500 }
        );
    }
}