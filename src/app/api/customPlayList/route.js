// app/api/customPlayList/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_URL = 'https://rubibox.ir/app-plus/api-test-web.php';
const API_KEY = 'sdifu4530dsf98sf0sdf';

async function fetchWithTimeout(input, init = {}) {
    const { timeout = 15000, ...rest } = init;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort('timeout'), timeout);
    try {
        const res = await fetch(input, {
            ...rest,
            signal: controller.signal,
            cache: 'no-store',
            headers: {
                ...(rest.headers || {}),
                'User-Agent': 'Mozilla/5.0 (compatible; NextJS-Proxy)',
            },
        });
        return res;
    } finally {
        clearTimeout(id);
    }
}

export async function POST(req) {


    try {
        const body = await req.json().catch(() => ({}));
        console.log('Request Body:', body);  // نمایش محتویات body

        const op = body?.op;
        if (!op) return NextResponse.json({ success: false, error: 'MISSING_OP' }, { status: 400 });

        const form = new URLSearchParams();
        form.set('key', API_KEY);

        if (op === 'list') {
            const user_name = body?.user_name ?? '';
            if (!user_name) return NextResponse.json({ success: false, error: 'MISSING_USER' }, { status: 400 });
            form.set('action', 'show_playlist_user');
            form.set('user_name', user_name);
            form.set('pageno', String(body?.pageno ?? 1));
        } else if (op === 'add') {
            const { user_name, video_id, list_id } = body || {};
            if (!user_name || !video_id || !list_id) {
                return NextResponse.json({ success: false, error: 'MISSING_PARAMS' }, { status: 400 });
            }
            form.set('action', 'add_music_to_playlist');
            form.set('user_name', user_name);
            form.set('video_id', String(video_id));
            form.set('list_id', String(list_id));
        } else if (op === 'create') {
            const { user_name, video_id, title } = body || {};
            if (!user_name || !video_id || !title) {
                return NextResponse.json({ success: false, error: 'MISSING_PARAMS' }, { status: 400 });
            }
            form.set('action', 'add_music_new_playlist');
            form.set('user_name', user_name);
            form.set('video_id', String(video_id));
            form.set('title', String(title));
        } else {
            return NextResponse.json({ success: false, error: 'UNKNOWN_OP' }, { status: 400 });
        }

        const upstream = await fetchWithTimeout(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },  // تغییر به urlencoded
            body: form,
            timeout: 15000,
        });

        const text = await upstream.text();
        let json = null;
        try { json = JSON.parse(text); } catch {}

        if (json) {
            return NextResponse.json({ success: true, ...json }, { status: 200 });
        }

        return NextResponse.json(
            {
                success: false,
                error: 'UPSTREAM_NON_JSON',
                statusCode: upstream.status,
                snippet: text.slice(0, 300),
            },
            { status: 502 }
        );
    } catch (e) {
        return NextResponse.json(
            { success: false, error: 'UPSTREAM_FETCH_FAILED', message: String(e?.message || e) },
            { status: 502 }
        );
    }
}

