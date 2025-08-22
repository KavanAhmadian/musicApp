import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const playlistId = searchParams.get('playlist_id');

        if (!playlistId) {
            return NextResponse.json({ error: 'playlist_id is required' }, { status: 400 });
        }

        const res = await fetch(
            `https://rubibox.ir/app-plus/api-test-web.php?key=sdifu4530dsf98sf0sdf&action=list_music&what_list=album_music&playlist_id=${encodeURIComponent(
                playlistId
            )}&pageno=1`,
            { cache: 'no-store' }
        );

        if (!res.ok) {
            return NextResponse.json({ error: 'Failed to fetch album tracks' }, { status: res.status });
        }

        const json = await res.json();
        return NextResponse.json(
            { all: Array.isArray(json?.list) ? json.list : json?.all || [] },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
    }
}
