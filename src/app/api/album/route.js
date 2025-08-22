import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const father = searchParams.get('father');

        if (!father) {
            return NextResponse.json({ error: 'father (singerId) is required' }, { status: 400 });
        }

        const res = await fetch(
            `https://rubibox.ir/app-plus/api-test-web.php?key=sdifu4530dsf98sf0sdf&action=search_playlist&what_list=Album&father=${encodeURIComponent(
                father
            )}`,
            { cache: 'no-store' }
        );

        if (!res.ok) {
            return NextResponse.json({ error: 'Failed to fetch data from rubibox' }, { status: res.status });
        }

        const json = await res.json();
        return NextResponse.json({ all: Array.isArray(json?.list) ? json.list : [] }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
    }
}
